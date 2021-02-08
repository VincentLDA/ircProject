import React from "react";
import axios from "axios";
import makeToast from "../Toaster";
import { withRouter } from "react-router-dom";

const ChatroomPage = ({ match, socket }) => {
  const chatroomId = match.params.id;
  const [messages, setMessages] = React.useState([]);
  const messageRef = React.useRef();
  const [userId, setUserId] = React.useState("");
  
  const sendMessage = () => {
    if (socket) {
      var commande = messageRef.current.value ;
      var com = commande.split(" ");
      if(com[0] == "/create"){

          const name = com[1];
          axios
            .post("http://localhost:8000/chatroom/", {
              name,
            })
            .then((response) => {
              makeToast("success", response.data.message);
            })
            .catch((err) => {
              // console.log(err);
              if (
                err &&
                err.response &&
                err.response.data &&
                err.response.data.message
              )
                makeToast("error", err.response.data.message);
            });

      }
      else{
        if (commande == "/list")
        {  
          axios
            .get("http://localhost:8000/chatroom", {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("CC_Token"),
              },
            })
            .then((response) => {
              var string = "";
              for(var i = 0; i< response.data.length; i++)
              {
                string = string + " " + response.data[i].name;
              }
              socket.emit("chatroomMessage", {
                chatroomId,
                message: string
              });
            })
            .catch((err) => {              
            });
        }
        else {
          if (commande == "/quit")
          {
            window.location.replace("http://localhost:3000/dashboard");
          }
          else{
            if(com[0] == "/delete"){
              axios
              .get("http://localhost:8000/chatroom", {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("CC_Token"),
                },
              })
              .then((response) => {
                var string = "";
                for(var i = 0; i< response.data.length; i++)
                {
                  string = string + " " + response.data[i].name;
                  if(response.data[i].name == com[1]){
                    axios
                    .delete("http://localhost:8000/chatroom",{
                      headers: {
                        Authorization: "Bearer " + localStorage.getItem("CC_Token"),
                      },
                    })
                    .then((response) => {
                      console.log("DELETE");
                    })
                  }
                  
                }
                socket.emit("chatroomMessage", {
                  chatroomId,
                  message: string
                });
              })
              .catch((err) => {              
              });
            }
            else{
              socket.emit("chatroomMessage", {
                chatroomId,
                message: messageRef.current.value,
              });
            }
            
          }
          
        }
        
      }
      messageRef.current.value = "";
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("CC_Token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    }
    if (socket) {
      socket.on("newMessage", (message) => {
        const newMessages = [...messages, message];
        setMessages(newMessages);
      });
    }
    //eslint-disable-next-line
  }, [messages]);

  React.useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", {
        chatroomId,
      });      
    }

    return () => {
      //Component Unmount
      if (socket) {
        socket.emit("leaveRoom", {
          chatroomId,
        });
      }
    };
    //eslint-disable-next-line
  }, []);

  return (
    <div className="chatroomPage">
      <div className="chatroomSection">
        <div className="cardHeader">Chatroom Name</div>
        <div className="chatroomContent">
          {messages.map((message, i) => (
            <div key={i} className="message">
              <span
                className={
                  userId === message.userId ? "ownMessage" : "otherMessage"
                }
              >
                {message.name}:
              </span>{" "}
              {message.message}
            </div>
          ))}
        </div>
        <div className="chatroomActions">
          <div>
            <input
              type="text"
              name="message"
              placeholder="Say something!"
              ref={messageRef}
            />
          </div>
          <div>
            <button className="join" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(ChatroomPage);
