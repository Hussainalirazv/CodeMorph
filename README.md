                                        🤖 CodeMorph: A Fine-Tuned CodeT5 Code Translation Tool


Welcome to the CodeMorph project! This is a full-stack web application designed to translate code from one programming language to another using a fine-tuned CodeT5 model.

🌟 Project Overview

CodeMorph provides a user-friendly interface for developers to translate code snippets instantly. The backend, built with FastAPI, uses a specialized machine learning model for translation, while the frontend, created with React, offers a seamless and interactive user experience.

✨ Features

1.  Code-to-Code Translation: Translate code between multiple programming languages.
2.  Intuitive UI: A clean and modern user interface built with Material-UI components.
3.  Language Selection: Easily select source and target languages from a dropdown list.
4.  Code Highlighting: Syntax highlighting in both the input and output editors for improved readability.
5.  File I/O: Upload code files for translation and download the translated output.
6.  Dark Mode: A convenient toggle to switch between light and dark themes.

         🛠️ Technologies Used

Frontend:

1. React (with Vite): For building the single-page application.

2. Material-UI: A popular React UI framework for a consistent design.

3. react-syntax-highlighter: For displaying formatted code.

Backend:

1. FastAPI: A high-performance Python web framework for the API.

2. transformers: The Hugging Face library for loading the machine learning model.

3. CodeT5: An encoder-decoder Transformer model for code, fine-tuned on the XLCoST dataset.

Machine Learning:

Model: A fine-tuned CodeT5 model.

Dataset: XLCoST, a benchmark dataset for cross-lingual code intelligence.

🚀 How to Launch the Project
To get CodeMorph up and running, you'll need to set up both the backend and frontend.

Backend Setup
Install Python dependencies:
The backend requires Python dependencies, including fastapi and transformers. You can install them by running:

    pip install fastapi transformers uvicorn
    
Start the server:
Navigate to the backend directory and run the app.py file using Uvicorn.

    uvicorn app:app --reload
    
The backend server will start at http://127.0.0.1:8000.

Frontend Setup
Install Node.js dependencies:
The frontend is a React project that uses Vite. Make sure you have Node.js and npm installed.

    npm install
    
Launch the development server:
Run the following command to start the frontend.

    npm run dev
    
The frontend will be accessible at http://127.0.0.1:5173 or a similar address.

🧠 How to Upload Your Own Models
The backend is configured to easily swap out the translation model. You can either use a model from the Hugging Face Hub or a local model stored on your machine.

Open app.py:
Locate the line where the model_name is defined.

Python

    model_name = "codet5-base-codet5-base-xlcost"
Change the model name:

For a Hugging Face model: Replace the model_name string with the name of the model you want to use. For example:

Python

    model_name = "your_username/your_model_name"
For a local model: If you have a model saved locally, you can specify the path to its directory.

Python

    model_name = "./path/to/your/local/model"
Restart the backend server:
After changing the model_name, be sure to restart your FastAPI server to load the new model. The new model will be used for all subsequent translation requests.
