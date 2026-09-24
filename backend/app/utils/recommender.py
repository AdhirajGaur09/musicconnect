from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.user import User


def build_feature_text(user: User) -> str:
    """Convert a user's profile fields into one text blob for comparison."""
    return " ".join([
        user.city or "",
        user.role or "",
        " ".join(user.genres or []),
        str(user.experience.value if user.experience else ""),
        user.bio or "",
    ])


def get_musician_recommendations(target_user: User, all_users: list[User], top_n: int = 5):
    # Remove the target user and inactive users from candidates
    candidates = [u for u in all_users if u.id != target_user.id and u.is_active]

    if len(candidates) == 0:
        return []

    texts = [build_feature_text(target_user)] + [build_feature_text(u) for u in candidates]

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(texts)

    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    ranked = sorted(zip(candidates, similarity_scores), key=lambda pair: pair[1], reverse=True)

    return [user for user, score in ranked[:top_n] if score > 0]