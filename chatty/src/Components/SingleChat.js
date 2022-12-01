import { useDisclosure, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../Config/ChatLogic";
import { ArrowBackIcon, LinkIcon } from "@chakra-ui/icons";
import ProfileModal from "./Misc/ProfileModal";
import ScrollableChat from "./ScrollableChat";
//import io from "socket.io-client";
import UpdateGroupChatModal from "./Misc/UpdateGroupChatModal";
import InputEmoji from "react-input-emoji";
/*const ENDPOINT = "http://localhost:5000";
var socket;*/

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  //  const [socketConnected, setSocketConnected] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [type, setType] = useState("");
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      await axios
        .get(`/api/message/${selectedChat._id}`, config)
        .then((res) => {
          setMessages(res.data);
          setLoading(false);
          // socket.emit("join chat", selectedChat._id);
        });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const sendMessage = async () => {
    if (newMessage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const message = {
          chatId: selectedChat._id,
          content: newMessage,
        };
        await axios
          .post(`/api/message`, message, config)
          .then((res) => {
            setNewMessage("");
            //  socket.emit("new message", res.data);
            setMessages([...messages, res.data]);
            setFetchAgain(!fetchAgain);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } else if (selectedImage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const attachment = {
          chatId: selectedChat._id,
          attachment: selectedImage,
        };

        await axios.post(`/api/message`, attachment, config).then((res) => {
          setSelectedImage();
          onClose();
          //socket.emit("new message", res.data);
          setMessages([...messages, res.data]);
          setFetchAgain(!fetchAgain);
        });
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the attachment",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  /*useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("user connected", () => setSocketConnected(true));
    // eslint-disable-next-line
  }, []);*/

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedChat]);

  /*useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
          setMessages([...messages, newMessageReceived]);
        }
      }
  });*/

  const postDetails = (uploads) => {
    setLoading(true);
    if (
      uploads.type === "image/jpeg" ||
      uploads.type === "image/png" ||
      uploads.type === "image/gif" ||
      uploads.type === "image/webm" ||
      uploads.type === "video/mp4" ||
      uploads.type === "video/3pg"
    ) {
      const data = new FormData();
      data.append("file", uploads);
      data.append("upload_preset", "Enchat-uploads");
      data.append("cloud_name", "enchat");
      fetch("https://api.cloudinary.com/v1_1/enchat/raw/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setSelectedImage(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      toast({
        title: "Accepted File Types are jpg, png, gif, webm, mp4 and 3pg.",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  function readURL(input) {
    var imageSource = document.getElementById("img");
    var videoSource = document.getElementById("forvideo");
    if (input) {
      //regex to check file type
      var imageExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.webm)$/i;
      var videoExtensions = /(\.mp4|\.3pg)$/i;
      imageExtensions.exec(input) ? setType("image") : setType("video");
      if (imageExtensions.exec(input)) {
        imageSource.setAttribute("src", URL.createObjectURL(input));
      }
      if (videoExtensions.exec(input)) {
        videoSource.setAttribute("src", URL.createObjectURL(input));
        videoSource.parentNode.load();
      }
    }
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display="flex"
              icon={<ArrowBackIcon />}
              onClick={() => {
                setSelectedChat("");
                setFetchAgain(!fetchAgain);
              }}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl isRequired mt={3}>
              <div style={{ display: "flex" }}>
                <InputEmoji
                  value={newMessage}
                  onChange={setNewMessage}
                  cleanOnEnter
                  onEnter={sendMessage}
                  placeholder="Type a message"
                />
                <>
                  <LinkIcon onClick={onOpen} w={5} h={5} marginTop={4} />

                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Please select a file</ModalHeader>
                      <ModalBody
                        display={"flex"}
                        flexDirection="column"
                        justifyContent={"center"}
                        alignItems="center"
                      >
                        <FormControl>
                          <Input
                            type="file"
                            p={1.5}
                            placeholder="Upload file"
                            accept="image/*, video/*"
                            onChange={(e) => {
                              postDetails(e.target.files[0]);
                              readURL(e.target.files[0]);
                            }}
                          />
                          <div>
                            {type === "image" ? (
                              <Image id="img" width="300px" height="300px" />
                            ) : (
                              <video
                                width="200"
                                height="200"
                                style={{ display: "none" }}
                                controls
                              >
                                <source id="forvideo" />
                              </video>
                            )}
                          </div>
                          <ModalFooter
                            display="flex"
                            justifyContent={"space-between"}
                          >
                            <Button color={"green"} onClick={sendMessage}>
                              Upload
                            </Button>
                            <Button color="red" onClick={onClose}>
                              Close
                            </Button>
                          </ModalFooter>
                        </FormControl>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};
export default SingleChat;
