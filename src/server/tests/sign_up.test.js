const request = require('supertest');
const app = require('../index')
const mongoose = require("mongoose");
const server = require('../index');

const User = require("../models/user");

let userId;

beforeAll(() => {
    mongoose.connect(process.env.DATABASE)
})

afterAll(async() => {
    // Delete the user from the database after running all the tests
    await User.findByIdAndDelete(userId);

    // Closing the DB connection allows Jest to exit successfully.
    mongoose.disconnect();
    server.close();

});

describe('POST /user', function() {
    it("successfully creates a user with valid information provided", async() => {
        const response = await request(app)
        .post("/users")
            .send({
                firstname: "Test",
                lastname: "epic",
                email: "test@email2.com",
                password: "test123",
                role: "User"
            })
            .expect(201); // successfully created account
        userId = response.body.id;
    });
    it("should not create a user if the email used already exists", async() => {
        var user =
            await request(app)
            .post("/users")
            .send({
                firstname: "Test",
                lastname: "1234",
                email: "test@email2.com",
                password: "test123",
                role: "User"
            })
            .expect(409)
    });
    it("should not create a user with missing fields", async() => {
        await request(app)
            .post("/users")
            .send({
                firstname: "Test",
                email: "test@mail.com",
                password: "test123"
            })
            .expect(400)
            .then((response) => {
                expect(response.text).toBe('{"message":"Please fill out all fields!"}')
            })
        });
    }   
);