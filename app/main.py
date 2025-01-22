from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from joblib import load
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.database import get_db, PredictionRecord
from app.utils import preprocess_text
from sqlalchemy import func
from fastapi.responses import JSONResponse

app = FastAPI()

# Serve static files (CSS, JS) from the 'static' directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load pre-trained ML model and vectorizer
model = load('model/model.pkl')
vectorizer = load('model/tfidf_vectorizer.pkl')

# Pydantic model for request body
class PredictionRequest(BaseModel):
    text: str

@app.post("/predict/")
def predict(request: PredictionRequest, db: Session = Depends(get_db)):
    """
    Predicts the mental state of the input text and saves the prediction to the database.
    """
    # Preprocess the input text
    preprocessed_text = preprocess_text(request.text)

    # Vectorize the preprocessed text
    vectorized_text = vectorizer.transform([preprocessed_text])

    # Make prediction using the model
    prediction = model.predict(vectorized_text)

    # Save prediction record to database
    prediction_record = PredictionRecord(input_text=request.text, predicted_status=prediction[0])
    db.add(prediction_record)
    db.commit()

    return {"input_text": request.text, "predicted_status": prediction[0]}

@app.get("/", response_class=HTMLResponse)
def get_form():
    """
    Returns the HTML form (index page) for prediction.
    """
    html_file_path = "templates/index.html"  # Path to your HTML file
    with open(html_file_path, "r") as file:
        return HTMLResponse(content=file.read())

@app.get("/predictions", response_class=JSONResponse)  # Return JSON response
def check_predictions(db: Session = Depends(get_db)):
    """
    Displays all the previous predictions stored in the database as JSON.
    """
    predictions = db.query(PredictionRecord).all()
    
    # Create a list of dictionaries to return as JSON
    predictions_list = [
        {  # assuming 'timestamp' is in your database model
            "id":prediction.id,
            "input_text": prediction.input_text,
            "predicted_status": prediction.predicted_status
        }
        for prediction in predictions
    ]
    
    return JSONResponse(content=predictions_list)

@app.get("/dashboard/", response_class=JSONResponse)
def dashboard(db: Session = Depends(get_db)):
    """
    Fetches counts of each predicted mental state for dashboard visualization.
    """
    prediction_counts = db.query(
        PredictionRecord.predicted_status, 
        func.count(PredictionRecord.predicted_status)
    ).group_by(PredictionRecord.predicted_status).all()
    
    # Convert to a dictionary for easier front-end consumption
    result = {status: count for status, count in prediction_counts}
    return JSONResponse(content=result)
