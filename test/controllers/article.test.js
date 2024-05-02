const { createArticle,
    updateArticle,
    deleteArticle,
    getTimeline,
    getArticlesUser,
    getArticle,
    likeUnlike,
} = require('../../src/controllers/articleController.js');
const Article = require('../../src/Models/articleModel');
const Comment = require('../../src/Models/commentModel');
const User = require('../../src/Models/userModel');

jest.mock('../../src/Models/userModel');
jest.mock('../../src/Models/commentModel');  // Mock the Comment model
jest.mock('../../src/Models/articleModel.js');  // Mock the Article model
jest.mock('../../src/Models/userModel', () => ({
    findById: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ followings: ['456'] }) // Ensure this returns the expected object
    })),
    findOne: jest.fn() // Mock other methods as needed
}));


let req, res, send, status;

beforeEach(() => {
    send = jest.fn();
    status = jest.fn().mockReturnValue({ send });
    res = { status };
});
// Tests for the Article Controller
describe('Article Controller', () => {
    let req, res, send, status;

    beforeEach(() => {
        send = jest.fn().mockImplementation((response) => {
            console.log('Send called with:', response);  // Logging the response sent
        });
        status = jest.fn().mockReturnValue({ send });
        res = { status };
    });


describe('createArticle', () => {
    it('should create an article successfully', async () => {
        const mockSave = jest.fn().mockResolvedValue(true);
        Article.mockImplementation(() => ({ save: mockSave }));
        const req = {
            body: { title: 'Test Article', content: 'This is a test' },
            user: { _id: '12345' }
        };
        const send = jest.fn();
        const status = jest.fn(() => ({ send }));
        const res = { status };

        await createArticle(req, res);

        expect(status).toHaveBeenCalledWith(200);
        expect(send).toHaveBeenCalledWith({
            status: 'success',
            message: 'article has been created',
        });
    });

    it('should handle errors', async () => {
        const mockError = new Error('Failed to create article');
        const mockSave = jest.fn().mockRejectedValue(mockError);
        Article.mockImplementation(() => ({ save: mockSave }));
        const req = {
            body: { title: 'Test Article', content: 'This is a test' },
            user: { _id: '12345' }
        };
        const send = jest.fn();
        const status = jest.fn(() => ({ send }));
        const res = { status };

        await createArticle(req, res);

        expect(status).toHaveBeenCalledWith(500);
        expect(send).toHaveBeenCalledWith({
            status: 'failure',
            message: mockError.message,
        });
    });

});
    describe('updateArticle', () => {
        it('should update the article successfully when the user is authorized', async () => {
            const req = { user: { _id: '123' }, params: { id: '1' }, body: { title: 'Updated Title' } };
            const article = { user: { toString: () => '123' } };
            Article.findById = jest.fn().mockResolvedValue(article);
            Article.updateOne = jest.fn().mockResolvedValue({ nModified: 1 });
            const send = jest.fn();
            const status = jest.fn(() => ({ send }));
            const res = { status };

            await updateArticle(req, res);

            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({
                status: "success",
                message: "article has been updated",
            });
        });

        it('should deny update when user is not authorized', async () => {
            const req = { user: { _id: '124' }, params: { id: '1' }, body: {} };
            const article = { user: { toString: () => '123' } };
            Article.findById = jest.fn().mockResolvedValue(article);
            const send = jest.fn();
            const status = jest.fn(() => ({ send }));
            const res = { status };

            await updateArticle(req, res);

            expect(status).toHaveBeenCalledWith(401);
            expect(send).toHaveBeenCalledWith({
                status: "failure",
                message: "you are not authorized",
            });
        });
    });

    describe('deleteArticle', () => {
        it('should allow article deletion by the owner', async () => {
            const req = { user: { _id: '123' }, params: { id: '1' } };
            const article = { user: { toString: () => '123' } };
            Article.findById = jest.fn().mockResolvedValue(article);
            Article.findByIdAndDelete = jest.fn().mockResolvedValue({});
            Comment.deleteMany = jest.fn().mockResolvedValue({});
            const send = jest.fn();
            const status = jest.fn(() => ({ send }));
            const res = { status };

            await deleteArticle(req, res);

            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({
                status: "success",
                message: "article has been deleted",
            });
        });

        it('should allow article deletion by an admin', async () => {
            const req = { user: { _id: 'admin', role: 'admin' }, params: { id: '1' } };
            const article = { user: { toString: () => '123' } };
            Article.findById = jest.fn().mockResolvedValue(article);
            Article.findByIdAndDelete = jest.fn().mockResolvedValue({});
            Comment.deleteMany = jest.fn().mockResolvedValue({});
            const send = jest.fn();
            const status = jest.fn(() => ({ send }));
            const res = { status };

            await deleteArticle(req, res);

            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({
                status: "success",
                message: "article has been deleted",
            });
        });

        it('should deny deletion for unauthorized user', async () => {
            const req = { user: { _id: '124' }, params: { id: '1' } };
            const article = { user: { toString: () => '123' } };
            Article.findById = jest.fn().mockResolvedValue(article);
            const send = jest.fn();
            const status = jest.fn(() => ({ send }));
            const res = { status };

            await deleteArticle(req, res);

            expect(status).toHaveBeenCalledWith(401);
            expect(send).toHaveBeenCalledWith({
                status: "failure",
                message: "you are not authorized",
            });
        });
    });


    describe('getArticle', () => {
        it('should retrieve an article successfully', async () => {
            const articleData = { _id: '1', title: 'Test Article', comment: [] };
            Article.findOne = jest.fn().mockResolvedValue(articleData);
            
            req = { params: { id: '1' } };
            
            await getArticle(req, res);
            
            expect(Article.findOne).toHaveBeenCalledWith({ _id: req.params.id });
            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith(articleData);
        });
    
        it('should handle errors when retrieving an article fails', async () => {
            const errorMessage = 'Error finding article';
            Article.findOne = jest.fn().mockRejectedValue(new Error(errorMessage));
            
            req = { params: { id: '1' } };
            
            await getArticle(req, res);
            
            expect(status).toHaveBeenCalledWith(500);
            expect(send).toHaveBeenCalledWith({
                status: 'failure',
                message: errorMessage
            });
        });
    });
    describe('likeUnlike', () => {
        it('should like an article if not already liked', async () => {
            const article = { _id: '1', likes: [], updateOne: jest.fn().mockResolvedValue({}) };
            Article.findById = jest.fn().mockResolvedValue(article);
            
            req = { user: { _id: 'user1' }, params: { id: '1' } };
            
            await likeUnlike(req, res);
            
            expect(Article.findById).toHaveBeenCalledWith(req.params.id);
            expect(article.updateOne).toHaveBeenCalledWith({ $push: { likes: req.user._id } });
            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({
                status: "success",
                message: "the article has been liked"
            });
        });
    
        it('should dislike an article if already liked', async () => {
            const article = { _id: '1', likes: ['user1'], updateOne: jest.fn().mockResolvedValue({}) };
            Article.findById = jest.fn().mockResolvedValue(article);
            
            req = { user: { _id: 'user1' }, params: { id: '1' } };
            
            await likeUnlike(req, res);
            
            expect(article.updateOne).toHaveBeenCalledWith({ $pull: { likes: req.user._id } });
            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({
                status: "success",
                message: "the article has been disliked"
            });
        });
    
        it('should handle errors during the like or unlike process', async () => {
            const errorMessage = 'Error updating article';
            Article.findById = jest.fn().mockRejectedValue(new Error(errorMessage));
            
            req = { user: { _id: 'user1' }, params: { id: '1' } };
            
            await likeUnlike(req, res);
            
            expect(status).toHaveBeenCalledWith(500);
            expect(send).toHaveBeenCalledWith({
                status: "failure",
                message: errorMessage
            });
        });
    });
    
    
    




    describe('getArticlesUser', () => {
        it('should return 500 if the user does not exist', async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            const req = { params: { username: 'nonexistent' } };
            const send = jest.fn();
            const status = jest.fn().mockReturnValue({ send });
            const res = { status };

            await getArticlesUser(req, res);

            expect(status).toHaveBeenCalledWith(500);
            expect(send).toHaveBeenCalledWith({
                status: 'failure',
                message: 'Cannot read properties of null (reading \'_id\')',
            });
        });
    });



});
