const request = require('supertest');
const app = require('../server');

describe('Book Review API Tests', () => {
    let authToken;
    
    // Test Task 1: Get all books
    describe('GET /books', () => {
        it('should return all books with success response', async () => {
            const res = await request(app)
                .get('/books')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data['1']).toBeDefined();
            expect(res.body.data['1'].author).toBe('Chinua Achebe');
        });
    });
    
    // Test Task 2: Get book by ISBN
    describe('GET /isbn/:isbn', () => {
        it('should return book by ISBN', async () => {
            const res = await request(app)
                .get('/isbn/1')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.author).toBe('Chinua Achebe');
            expect(res.body.data.title).toBe('Things Fall Apart');
        });
        
        it('should return 404 for non-existent ISBN', async () => {
            const res = await request(app)
                .get('/isbn/999')
                .expect(404);
                
            expect(res.body.error).toBe(true);
        });
        
        it('should return 400 for invalid ISBN format', async () => {
            const res = await request(app)
                .get('/isbn/abc')
                .expect(400);
                
            expect(res.body.error).toBe(true);
            expect(res.body.message).toBe('Invalid ISBN format');
        });
    });

    // Test Task 3: Get books by Author
    describe('GET /author/:author', () => {
        it('should return books by author', async () => {
            const res = await request(app)
                .get('/author/jane')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(Object.keys(res.body.data).length).toBeGreaterThan(0);
        });
        
        it('should return 404 for non-existent author', async () => {
            const res = await request(app)
                .get('/author/nonexistentauthor')
                .expect(404);
                
            expect(res.body.error).toBe(true);
        });
    });
    
    // Test Task 4: Get books by Title
    describe('GET /title/:title', () => {
        it('should return books by title', async () => {
            const res = await request(app)
                .get('/title/pride')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
        
        it('should return 404 for non-existent title', async () => {
            const res = await request(app)
                .get('/title/nonexistenttitle')
                .expect(404);
                
            expect(res.body.error).toBe(true);
        });
    });
    
    // Test Task 5: Get book reviews
    describe('GET /review/:isbn', () => {
        it('should return reviews for a book', async () => {
            const res = await request(app)
                .get('/review/1')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
        
        it('should return 404 for non-existent book', async () => {
            const res = await request(app)
                .get('/review/999')
                .expect(404);
                
            expect(res.body.error).toBe(true);
        });
    });
    
    // Test Task 6: Register new user
    describe('POST /register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    password: 'testpassword123'
                })
                .expect(201);
            
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('User registered successfully');
        });
        
        it('should not register user with existing username', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    password: 'testpassword123'
                })
                .expect(409);
                
            expect(res.body.error).toBe(true);
        });
        
        it('should not register user with short password', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    username: 'newuser',
                    password: '123'
                })
                .expect(400);
                
            expect(res.body.error).toBe(true);
            expect(res.body.message).toBe('Password must be at least 6 characters long');
        });
    });
    
    // Test Task 7: Login user
    describe('POST /login', () => {
        it('should login existing user and return token', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'testuser',
                    password: 'testpassword123'
                })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user).toBe('testuser');
            authToken = res.body.data.token;
        });
        
        it('should not login with wrong credentials', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                })
                .expect(401);
                
            expect(res.body.error).toBe(true);
        });
    });
    
    // Test Task 8: Add review (authenticated)
    describe('PUT /auth/review/:isbn', () => {
        it('should add a review when authenticated', async () => {
            const res = await request(app)
                .put('/auth/review/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    review: 'This is a great book!'
                })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Review added/modified successfully');
        });
        
        it('should not add review without authentication', async () => {
            const res = await request(app)
                .put('/auth/review/1')
                .send({
                    review: 'This is a great book!'
                })
                .expect(401);
                
            expect(res.body.message).toBe('Access token required');
        });
        
        it('should not add empty review', async () => {
            const res = await request(app)
                .put('/auth/review/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    review: ''
                })
                .expect(400);
                
            expect(res.body.error).toBe(true);
            expect(res.body.message).toBe('Valid review content is required');
        });
    });

    // Test Task 9: Delete book review
    describe('DELETE /auth/review/:isbn', () => {
        it('should delete a review when authenticated', async () => {
            const res = await request(app)
                .delete('/auth/review/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Review deleted successfully');
        });
        
        it('should not delete review without authentication', async () => {
            await request(app)
                .delete('/auth/review/1')
                .expect(401);
        });
    });
    
    // Test Task 10: Async books
    describe('GET /async/books', () => {
        it('should return books using async callback', async () => {
            const res = await request(app)
                .get('/async/books')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data['1']).toBeDefined();
        });
    });
    
    // Test Task 11: Promise ISBN
    describe('GET /promise/isbn/:isbn', () => {
        it('should return book using promises', async () => {
            const res = await request(app)
                .get('/promise/isbn/1')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.author).toBe('Chinua Achebe');
        });
    });
    
    // Test Task 12: Promise Author
    describe('GET /promise/author/:author', () => {
        it('should return books by author using promises', async () => {
            const res = await request(app)
                .get('/promise/author/jane')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });
    
    // Test Task 13: Async Title
    describe('GET /async/title/:title', () => {
        it('should return books by title using async/await', async () => {
            const res = await request(app)
                .get('/async/title/pride')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });
});