------------------------------💙----------------------------
Funky Match - Backend API:
🚀 Core Features:

✨ User Management ✨
JWT authentication system

Role-based access control (User/Moderator/Admin)

Comprehensive ban system (temporary/permanent)

Hobby-based user matching

Profile customization

Real-Time Communication
Socket.io powered chat

Group chats by hobbies

Private messaging

Content System
User posts with images

Like functionality

Moderation tools

------------------------------💙----------------------------
🛠️ Technical Stack:
Runtime: Node.js

Framework: Express.js

Database: MongoDB (Mongoose)

Real-Time: Socket.io

Auth: JWT + Bcrypt

Validation: Joi
------------------------------💙----------------------------
✨ # Key Dependencies # ✨
"express": "^4.21.1",
"mongoose": "^8.9.0", 
"socket.io": "^4.8.1",
"jsonwebtoken": "^9.0.2",
"bcryptjs": "^2.4.3"
------------------------------💙----------------------------
🚦 Rate Limiting & Security:

100 requests/15min window

Helmet middleware enabled

Sanitized input handling

Password encryption (bcrypt)
------------------------------💙----------------------------
🌟 Getting Started:
Clone the repository

🛠️ Development:
Install dependencies: npm install

Start the development server: npm run dev

------------------------------💙----------------------------
🔐 Environment Configuration:
The .env file will be provided as a seperate zip file

-------------------🌐 API Endpoints 🌐-----------------------
                    
🔑 Authentication & User Routes:


Method  Endpoint	        Description	              Access
------------------------------------------------------------
POST	/users/register	Register new user	            Public
POST	/users/login	Login existing user	            Public
GET	/users/	  List all users (with limited fields)	Admin
GET	/users/:id	Get full user profile	        Owner/Admin
GET   /users/public/:id	Get public profile data	      Public
PUT	/users/:id	Update profile details	         Owner/Admin
PATCH	/users/:id	Change user role (User/Moderator/Admin)	  Admin
DELETE	/users/:id	Delete account	             Owner/Admin

------------------------------💙----------------------------

💬 Chat & Messaging:


Method	Endpoint       	Description	  -   Access
------------------------------------------------------------
GET	/users/private-messages/:roomId	Get chat history	- Participants

GET	/users/:id/private-messages	List all conversations	- Owner

POST	/users/:id/send-private-message	Send private message	- Owner


------------------------------💙----------------------------

🛡️ Admin Moderation:


Method	        Endpoint	             Description
------------------------------------------------------------
POST	    /users/admin/ban	    Ban user(temporary/permanent)

DELETE	/users/admin/ban/:userId	 Remove user ban

GET	  /users/admin/bans/:userId	  View user's ban history


------------------------------💙----------------------------

📝 Posts System:

Method   Endpoint       Description    Access
---------------------------------------------------
POST - /posts/ - Create new post (with image) - Registered Users
GET  -  /posts/  -  List all posts  -    Admin Only
GET  -  /posts/user/:id - Get user's posts   Profile Owner  
GET  -  /posts/public/user/:id - Get public posts  Public
PUT  -   /posts/:id - Edit post content/image   Post Owner
DELETE - /posts/:id  -   Delete post -   Post Owner
PATCH -  /posts/:id - Like/unlike post - Registered Users

✅ Features:
- Image uploads (5MB max)
- Edit posts
- Real-time like updates
- Public/private viewing modes
- Admin oversight

------------------------------💙----------------------------

🎯 Hobby System:

Method	   Endpoint	                Description
------------------------------------------------------------
GET	  /users/hobbies/all	   List all available hobbies
PATCH	  /users/:id/add-hobby	      Add hobby to profile
PATCH	  /users/:id/remove-hobby	  Remove hobby from profile
GET	  /users/members/:hobby	    Find users by hobby

------------------------------💙----------------------------

🚧 Unimplemented Frontend Features (Backend-Ready):
📝 Join Request System:


| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/requests/` | Submit join request |
| PATCH  | `/requests/:id` | Approve/reject request |

✅ **Backend Complete:**
- Automatic cooldown periods
- Request status tracking
- Moderation workflow

------------------------------💙----------------------------
⚖️ Group-Specific Moderation:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/moderation/group-ban` | Ban from specific hobby group |
| DELETE | `/moderation/ban/:id` | Remove group ban |

✅ **Backend Includes:**
- Separate ban durations per group
- Moderation audit logs
- Ban expiration handling
------------------------------💙----------------------------

💙 Made with ❤️ by Hanady Abo Hamdan and Yahav Vaknin 💙
