import React, { useContext, useEffect, useState } from "react";
import { Context } from "../UserSession";
import axios from "axios";
import "../css/userTimeline.css";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import { TextField } from "@mui/material";
import swal from 'sweetalert';
import { useNavigate } from "react-router-dom";

const UserTimeline = () => {
  //Global state
  const [login, setLogin] = useContext(Context);
  
  //Get id of logged in user
  const userID = sessionStorage.getItem("userID");

  const navigate = useNavigate();
  const [userConnections, setUserConnections] = useState(
    {
      _id: "",
      firstname: "",
      lastname: "",
      connections: [],
    }
  );

  const fetchUserConnections = async () => {
    try{
      if(userID){
        const response = await axios.get(
          `http://localhost:9000/users/profile/${userID}`
        );
        setUserConnections({
          _id: response.data._id,
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          connections: response.data.connections,
        });
      }
    } catch (error) {
      console.log(error);
   }
  };

  //fetch session once
  useEffect(() => {
    fetchSession();
    fetchUserConnections();
    fetchConnections();
    //fetchConnectionPosts();
    fetchPosts();
  }, []);

  //Fetch session information
  const fetchSession = async () => {
    try {
      const response = await axios.get(`session`);
      setLogin({
        isLoggedIn: true,
      });
      sessionStorage.setItem("userID", response.data.user_info.user_id);
      sessionStorage.setItem("firstname", response.data.user_info.firstname);
      sessionStorage.setItem("lastname", response.data.user_info.lastname);
      sessionStorage.setItem("role", response.data.user_info.role);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [postData, setpostData] = useState({
    description: "",
    attachment: null,
    timestamp: new Date()
  });

  //HTTP Request to fetch posts and add posts ....
  const savePost = async () => {
    axios
      .post(`http://localhost:9000/users/post`, {
        _id: sessionStorage.getItem("userID"), 
        firstname: sessionStorage.getItem("firstname"),
        lastname: sessionStorage.getItem("lastname"), 
        description: postData.description,
        timestamp: postData.timestamp
      })
      .then((response) => {
        console.log(response.data);
        swal("Congrats!", "You have successfully created a post!","success",{
          button:false,
          timer:1000
        });
        navigate("/userTimeline");
      })
      .then((response) => {
        setTimeout(function(){
          window.location.reload();
        }, 1200);
      })
      .catch((error) => {
        console.log(error);
        swal("Failed", "Your post was not created, try again!", "error",{
          button:false,
          timer:1000
        })
      });
  };

  const [connections, setConnections] = useState([]);
  const fetchConnections = async () => {
    await axios.get(`http://localhost:9000/users/${userID}/connections`)
    .then(response => {
      setConnections(response.data)
    })
  }

  const [posts, setPosts] = useState([]);
  const fetchPosts = async () => {
    await axios.get(`http://localhost:9000/users/${userID}/posts`)
    .then(response => {
      setPosts(response.data)
    })
  }

  const userPosts = posts.map((post) => (
    <div className="userPostsTimeline">
      <span className="subTitleTimeline">{post.firstname}{" "}{post.lastname}</span>
      <p className="postText">
        {post.description}
      </p>
    </div>
  ))

  //const allPosts = [...allConnectionsPosts, ...userPosts]
  const allSortedPosts = [...userPosts].sort((a,b) =>{
    return a.timestamp > b.timestamp ? 1 : -1
  })

  return (
    <div>
      {userID && login ? (
        <div className="userTimelineContainer">
          {/* User Information Component */}
          <div className="leftTimeline">
            <div className="userContainerTimeline">
              <img
                src="https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg"
                alt="default pic"
                style={{
                  height: 90,
                  width: 90,
                  display: "block",
                  margin: "auto",
                }}
              ></img>
            </div>
            
            <span className="userNameTimeline">
              {sessionStorage.getItem("firstname")}{" "}
              {sessionStorage.getItem("lastname")}
            </span>
            <br></br>
            <span className="connectionsLinkTimeline">View Connections</span>
          </div>

          {/* User posts section*/}
          <div className="middleTimeline">
            {/* Create a post section*/}
            <div className="userInformationTimeline">
              <IconButton>
                <EditIcon onClick={savePost} fontSize="medium"></EditIcon>
              </IconButton>
              <TextField
                id="outlined-basic"
                label="Start A Post"
                variant="standard"
                className="postTextField"
                value= {postData.description}
                onChange={e => setpostData({ ...postData, description: e.target.value })}
              />
              <div className="timestamp" value={Date.now()} 
              onChange={e => setpostData({...postData, timestamp: e.target.value})} />
                
              {/* <input className="imageFile" type="file" accept=".png" name="image" 
              onChange={e => setpostData({...postData, attachment: e.target.files[0]})}/> */}
            </div>
            {/* user's post in their timeline*/}
            <div>
              {/* each div is a single post*/}
              {allSortedPosts}
            </div>
          </div>
          <div className="right">
            <span className="subTitle">Contacts</span>
            <br></br>
            <div>
              <ul>
                {userConnections && (userConnections.connections.map((connection) => {
                  return (
                    <>
                    <l1 className="connectionsInfo">
                      <img
                      src="https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg"
                      alt="comapnyPic"
                      className="companyPic"></img>
                      <div>
                        <span className="connectionName">{connection.firstname} {connection.lastname}</span>
                      </div>
                      </l1>
                    </>
                  );
                }))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <h1 style={{ textAlign: "center" }}>Please login to your account</h1>
      )}
    </div>
  );
};

export default UserTimeline;
