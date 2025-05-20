import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.document_loaders import UnstructuredFileLoader, PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate


app = Flask(__name__)
CORS(app)

# Your existing LLM and prompt setup
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.0-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    google_api_key="your_api_key",
)

template = """
Use the following context (delimited by <ctx></ctx>) and the chat history (delimited by <hs></hs>) to answer the question:
------
<ctx>
{context}
</ctx>
------
<hs>
{history}
</hs>
------
{question}
Answer:
"""
prompt = PromptTemplate(
    input_variables=["history", "context", "question"],
    template=template,
)

# Globals to hold the QA chain and conversation history
qa = None
conversation_history = []

def create_qa_chain(documents):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_documents(documents)
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key="AIzaSyC6TmVb5Vk5J0r6z0oCmjvNgzbblDKuf3Y"
    )
    db = FAISS.from_documents(texts, embeddings)
    retriever = db.as_retriever()
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        memory=memory
    )
    return qa_chain

@app.route("/chat", methods=["POST"])
def chat():
    global qa
    global conversation_history

    # Get message text
    message = request.form.get("message", "").strip()
    if not message:
        return jsonify({"response": "Please enter a message."})

    # Check for uploaded file (only process once, if new file uploaded)
    if "file" in request.files:
        uploaded_file = request.files["file"]
        if uploaded_file.filename != "":
            # Process file only if new file uploaded (reset qa)
            # Save file temporarily to disk (required by PyPDFLoader, UnstructuredFileLoader)
            file_path = f"./temp_{uploaded_file.filename}"
            print("uploaded file", file_path)
            uploaded_file.save(file_path)

            # Determine loader based on extension
            if file_path.endswith(".pdf"):
                loader = PyPDFLoader(file_path)
            elif file_path.endswith(".docx") or file_path.endswith(".txt"):
                loader = UnstructuredFileLoader(file_path)
            else:
                os.remove(file_path)
                return jsonify({"response": "Unsupported file type."})

            documents = loader.load()
            qa = create_qa_chain(documents)
            conversation_history = []  # Reset chat history on new file
            os.remove(file_path)

            # Optionally send a confirmation for upload (frontend can show or ignore)
            #return jsonify({"response": "File uploaded and processed successfully. Ask your question now!"})

    # If qa is None, no document uploaded yet
    if qa is None:
        return jsonify({"response": "Please upload a document first."})

    # Add user message to history
    conversation_history.append({"sender": "user", "text": message})

    # Get bot reply from QA chain
    try:
        bot_response = qa.run(message)
    except Exception as e:
        bot_response = f"Error processing your request: {str(e)}"

    # Add bot message to history
    conversation_history.append({"sender": "zara", "text": bot_response})

    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
