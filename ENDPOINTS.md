# 📚 API Documentation - Letterboxd UAM Movie Reviews

## 🔐 Authentication

All protected endpoints require Bearer token authentication:
```
Authorization: Bearer {your-token}
```

---

## 🎬 MOVIES ENDPOINTS

### 1. GET /api/movies
**List all movies with pagination**

**Authentication:** None required  
**Method:** GET  
**Query Parameters:**
- `per_page` (optional): Number of movies per page (default: 15)
- `page` (optional): Page number (default: 1)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "The Matrix",
      "release_date": "1999-03-31",
      "director_id": 1,
      "synopsis": "A computer hacker learns about the true nature of reality.",
      "duration": 136,
      "poster_path": "http://localhost:8000/storage/posters/matrix.jpg",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 67
  },
  "links": {
    "first": "http://localhost:8000/api/movies?page=1",
    "last": "http://localhost:8000/api/movies?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/movies?page=2"
  }
}
```

---

### 2. GET /api/movies/{id}
**Get detailed movie information**

**Authentication:** None required  
**Method:** GET  
**URL Parameters:**
- `id`: Movie ID (integer)

**Query Parameters:**
- `include` (optional): Comma-separated list of relationships to include
  - `director` - Include director information
  - `cast` - Include cast with character names
  - `genres` - Include movie genres
  - `reviews` - Include reviews with ratings

**Example:** `/api/movies/1?include=director,cast,reviews`

**Response (200):**
```json
{
  "id": 1,
  "title": "The Matrix",
  "release_date": "1999-03-31",
  "director_id": 1,
  "synopsis": "A computer hacker learns about the true nature of reality.",
  "duration": 136,
  "poster_path": "http://localhost:8000/storage/posters/matrix.jpg",
  "director": {
    "id": 1,
    "name": "Lana Wachowski"
  },
  "cast": [
    {
      "id": 1,
      "name": "Keanu Reeves",
      "character_name": "Neo"
    }
  ],
  "reviews": {
    "count": 150,
    "average_rating": 4.2,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "rating": 5,
        "comment": "Amazing movie!",
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "message": "Película no encontrada"
}
```

---

### 3. GET /api/movies/search
**Advanced movie search**

**Authentication:** None required  
**Method:** GET  
**Query Parameters (all optional):**
- `title`: Search by movie title (partial match, case-insensitive)
- `release_date`: Exact date match (YYYY-MM-DD format)
- `director_id`: Filter by director ID
- `actor_id`: Filter movies containing specific actor
- `genre_id`: Filter by genre ID
- `per_page`: Results per page (default: 15)
- `page`: Page number (default: 1)

**Examples:**
- `/api/movies/search?title=Matrix`
- `/api/movies/search?director_id=1&genre_id=2`
- `/api/movies/search?actor_id=5&release_date=1999-03-31`

**Response:** Same as GET /api/movies

---

### 4. GET /api/movies/popular
**Get popular movies by review count and rating**

**Authentication:** None required  
**Method:** GET  
**Query Parameters:**
- `limit` (optional): Maximum movies to return (default: 10, max: 50)
- `include` (optional): Include relationships (director, cast, reviews)

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "The Matrix",
    "release_date": "1999-03-31",
    "director_id": 1,
    "synopsis": "A computer hacker learns about the true nature of reality.",
    "duration": 136,
    "reviews_summary": {
      "count": 150,
      "average_rating": 4.2
    }
  }
]
```

---

### 5. GET /api/movies/{id}/statistics
**Get detailed movie statistics**

**Authentication:** None required  
**Method:** GET  
**URL Parameters:**
- `id`: Movie ID

**Response (200):**
```json
{
  "movie_id": 1,
  "title": "The Matrix",
  "statistics": {
    "total_reviews": 150,
    "average_rating": 4.2,
    "rating_distribution": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 40,
      "5": 80
    },
    "recent_reviews_count": 25,
    "last_review_date": "2024-11-01T10:30:00.000000Z"
  }
}
```

---

### 6. POST /api/movies
**Create new movie with poster upload**

**Authentication:** Required (Admin only)  
**Method:** POST  
**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "title": "The Matrix",
  "release_date": "1999-03-31",
  "director_id": 1,
  "synopsis": "A computer hacker learns about the true nature of reality.",
  "duration": 136,
  "poster": "[FILE UPLOAD - JPEG/PNG/JPG/GIF, max 2MB]"
}
```

**Required Fields:** title, release_date, director_id, duration  
**Optional Fields:** synopsis, poster

**Response (201):**
```json
{
  "id": 1,
  "title": "The Matrix",
  "release_date": "1999-03-31",
  "director_id": 1,
  "synopsis": "A computer hacker learns about the true nature of reality.",
  "duration": 136,
  "poster_path": "http://localhost:8000/storage/posters/matrix.jpg",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Error Response (422):**
```json
{
  "message": "The poster must be an image.",
  "errors": {
    "poster": ["The poster must be an image."]
  }
}
```

---

### 7. PUT /api/movies/{id}
**Update movie with poster upload**

**Authentication:** Required (Admin only)  
**Method:** PUT  
**Content-Type:** `multipart/form-data`  
**URL Parameters:** id (movie ID)

**Request Body:** Same as POST, all fields optional for update

**Response (200):** Same as POST response

---

### 8. DELETE /api/movies/{id}
**Delete movie**

**Authentication:** Required (Admin only)  
**Method:** DELETE  
**URL Parameters:** id (movie ID)

**Response (200):**
```json
{
  "message": "Película eliminada exitosamente"
}
```

---

## 🎭 MOVIE CAST ENDPOINTS

### 9. GET /api/movie-casts
**List all movie cast entries**

**Authentication:** None required  
**Method:** GET  
**Pagination:** Same as movies

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "actor_id": 1,
      "character_name": "Neo",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 10. GET /api/movie-casts/{id}
**Get specific cast entry**

**Authentication:** None required  
**Method:** GET  
**URL Parameters:** id (cast entry ID)

---

### 11. POST /api/movie-casts
**Create movie cast entry**

**Authentication:** Required (Admin only)  
**Method:** POST

**Request Body:**
```json
{
  "movie_id": 1,
  "actor_id": 1,
  "character_name": "Neo"
}
```

---

### 12. PUT /api/movie-casts/{id}
**Update cast entry**

**Authentication:** Required (Admin only)  
**Method:** PUT

---

### 13. DELETE /api/movie-casts/{id}
**Delete cast entry**

**Authentication:** Required (Admin only)  
**Method:** DELETE

---

## ⭐ REVIEWS ENDPOINTS

### 14. GET /api/reviews
**List all reviews**

**Authentication:** Required  
**Method:** GET  
**Pagination:** Same as movies

---

### 15. GET /api/reviews/{id}
**Get specific review**

**Authentication:** Required  
**Method:** GET

---

### 16. GET /api/reviews/my-reviews
**Get user's own reviews**

**Authentication:** Required  
**Method:** GET  
**Query Parameters:**
- `include` (optional): Include movie information (`movie`)
- `per_page`, `page`: Pagination

**Example:** `/api/reviews/my-reviews?include=movie`

---

### 17. GET /api/movies/{movieId}/reviews
**Get reviews for specific movie**

**Authentication:** None required  
**Method:** GET  
**URL Parameters:** movieId  
**Pagination:** Available

---

### 18. POST /api/reviews
**Create new review**

**Authentication:** Required  
**Method:** POST

**Request Body:**
```json
{
  "movie_id": 1,
  "rating": 5,
  "comment": "Amazing movie!"
}
```

**Required:** movie_id, rating (1-5)  
**Optional:** comment

---

### 19. PUT /api/reviews/{id}
**Update review (owner only)**

**Authentication:** Required (Review owner only)  
**Method:** PUT

---

### 20. DELETE /api/reviews/{id}
**Delete review (owner only)**

**Authentication:** Required (Review owner only)  
**Method:** DELETE

---

## 🎭 ACTORS ENDPOINTS

### 21. GET /api/actors
**List all actors**

**Authentication:** None required  
**Method:** GET  
**Pagination:** Available

**Response:**
```json
{
  "data": [
    {
      "actor_id": 1,
      "actor_name": "Keanu Reeves",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 22. GET /api/actors/{id}
**Get specific actor**

**Authentication:** None required  
**Method:** GET

---

### 23. POST /api/actors
**Create actor**

**Authentication:** Required (Admin only)  
**Method:** POST

**Request Body:**
```json
{
  "actor_name": "Keanu Reeves"
}
```

---

### 24. PUT /api/actors/{id}
**Update actor**

**Authentication:** Required (Admin only)  
**Method:** PUT

---

### 25. DELETE /api/actors/{id}
**Delete actor**

**Authentication:** Required (Admin only)  
**Method:** DELETE

---

## 🎥 DIRECTORS ENDPOINTS

### 26. GET /api/directors
**List all directors**

**Authentication:** None required  
**Method:** GET  
**Pagination:** Available

---

### 27. GET /api/directors/{id}
**Get specific director**

**Authentication:** None required  
**Method:** GET

---

### 28. POST /api/directors
**Create director**

**Authentication:** Required (Admin only)  
**Method:** POST

---

### 29. PUT /api/directors/{id}
**Update director**

**Authentication:** Required (Admin only)  
**Method:** PUT

---

### 30. DELETE /api/directors/{id}
**Delete director**

**Authentication:** Required (Admin only)  
**Method:** DELETE

---

## 🎭 GENRES ENDPOINTS

### 31. GET /api/genres
**List all genres**

**Authentication:** None required  
**Method:** GET

---

### 32. GET /api/genres/{id}
**Get specific genre**

**Authentication:** None required  
**Method:** GET

---

### 33. POST /api/genres
**Create genre**

**Authentication:** Required (Admin only)  
**Method:** POST

---

### 34. PUT /api/genres/{id}
**Update genre**

**Authentication:** Required (Admin only)  
**Method:** PUT

---

### 35. DELETE /api/genres/{id}
**Delete genre**

**Authentication:** Required (Admin only)  
**Method:** DELETE

---

## 🔐 AUTHENTICATION ENDPOINTS

### 36. POST /api/register
**User registration**

**Authentication:** None required  
**Method:** POST

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

---

### 37. POST /api/login
**User login**

**Authentication:** None required  
**Method:** POST

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "1|abc123def456..."
}
```

---

### 38. POST /api/logout
**User logout**

**Authentication:** Required  
**Method:** POST

---

### 39. GET /api/user
**Get current user info**

**Authentication:** Required  
**Method:** GET

---

### 40. PUT /api/profile
**Update user profile**

**Authentication:** Required  
**Method:** PUT

---

### 41. PUT /api/change-password
**Change password**

**Authentication:** Required  
**Method:** PUT

---

## 📝 Usage Examples

### **Search movies by multiple criteria:**
```bash
GET /api/movies/search?title=action&genre_id=1&director_id=5
```

### **Get movie with all details:**
```bash
GET /api/movies/1?include=director,cast,genres,reviews
```

### **Create movie with poster:**
```bash
curl -X POST http://localhost:8000/api/movies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Inception" \
  -F "release_date=2010-07-16" \
  -F "director_id=2" \
  -F "duration=148" \
  -F "poster=@/path/to/poster.jpg"
```

### **Get user's reviews with movie info:**
```bash
GET /api/reviews/my-reviews?include=movie
```

### **Get popular movies:**
```bash
GET /api/movies/popular?limit=20&include=director
```

## ⚠️ Error Responses

### **401 Unauthorized:**
```json
{
  "message": "Unauthenticated."
}
```

### **403 Forbidden:**
```json
{
  "message": "No tienes permiso para editar esta reseña"
}
```

### **404 Not Found:**
```json
{
  "message": "Película no encontrada"
}
```

### **422 Validation Error:**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["El título es obligatorio."],
    "rating": ["La calificación debe estar entre 1 y 5."]
  }
}
```

## 🔗 File Storage

Movie posters are stored in `storage/app/public/posters/` and served via `http://your-domain.com/storage/posters/filename.jpg`. Run `php artisan storage:link` to create the symbolic link.

## 📊 Pagination

All list endpoints support pagination with `per_page` and `page` query parameters. Default `per_page` is 15.

## 🏷️ Status Codes

- **200**: Success
- **201**: Created
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error