import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer


def preprocess_text(text: str) -> str:
    """
    Preprocess the input text by:
    - Converting text to lowercase
    - Tokenizing the text into words
    - Removing stopwords
    - Removing non-alphabetical characters
    - Lemmatizing the words to their root form

    Args:
    - text (str): The input text string.

    Returns:
    - str: The preprocessed text.
    """
    # Convert text to lowercase
    text = text.lower()

    # Tokenize the text (split into words)
    words = word_tokenize(text)

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]

    # Remove non-alphabetic characters (punctuation, numbers, etc.)
    words = [word for word in words if word.isalpha()]

    # Lemmatize the words (convert to root form)
    lemmatizer = WordNetLemmatizer()
    lemmatized_words = [lemmatizer.lemmatize(word) for word in words]

    # Join the words back into a string
    return ' '.join(lemmatized_words)
