# AnonWall: Anonymous Social Web App

**⚠︎ ARCHIVED ⚠︎**   
> This was a learning experiment in building a full‑stack anonymous social web app with Flask, SocketIO, and PostgreSQL.     
> I’ve taken what I learned and moved on to cleaner, better‑planned project.
>
**What is AnonWall**   
> If it was finished, AnonWall could have been an anonymous posting platform where users can:
> - Sign up with a private username and a public “alt name”
> - Create posts and comments under their chosen alt
> - Like posts and comments
> - View a global wall and their own profile wall
> - Manage up to 3 alt names per account
> 
> The goal was to build a space for free expression without identity pressure.
>
**What I Learned**  
> From the previous project, carried over to this one:
> - Flask + SocketIO for real‑time communication
> - PostgreSQL schema design and querying
> - Cookie‑based authentication and session handling
>    
> From this project:
> - Optimistic UI updates (likes, comments)
> - Modular JavaScript with ES modules
> - Better understanding of data attributes
> - Sharper JavaScript understanding in general
>
**Why I Archived It**   
> The codebase grew messy because I built it while learning. 
> Dataflow and component relationships became too confusing.
> Features were added without a clear roadmap, and I started spending more time fixing bugs than building. 
> Rather than forcing a rebuild on top of it, I chose to archive this version and start fresh with a clearer plan.
>
**How to Run It (If You Really Care To)**  
> - Clone the repo
> - Set up a virtual environment
> - Install dependencies: pip install -r requirements.txt
> - Set up database schema in Supabase
> - Set up a .env file with your DATABASE_URL
> - Run python app.py
> - Open `http://localhost:5000`
> 
> Go back to earlier commits if the latest versions don't work very well (I know they don't).
>
**Well?**  
> Checkout my new project: [Greenwall](https://github.com/res-londres/greenwall)  
> It's the better social web app that hopefully I would actually finish.
