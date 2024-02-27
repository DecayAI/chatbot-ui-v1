import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import logoImage from './images/download.png';



export default function App() {
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const messageContainerRef = useRef(null);
  const loadBotpressScript = () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
    script.async = true;
    script.onload = initializeBotpressWebChat;
    document.body.appendChild(script);
    setTimeout(() => window.botpressWebChat.sendEvent({ type: 'show' }), 500);
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeBotpressWebChat = () => {
    window.botpressWebChat.init({
      "composerPlaceholder": "Chat with bot",
      "botConversationDescription": "This chatbot was built surprisingly fast with Botpress",
      "botId": "f5833677-e319-4a5f-a037-103c05ad8269",
      "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
      "messagingUrl": "https://messaging.botpress.cloud",
      "clientId": "f5833677-e319-4a5f-a037-103c05ad8269",
      "webhookId": "e10a0b5a-534b-4f84-94f0-dd998815e2f3",
      "lazySocket": true,
      "themeName": "prism",
      "frontendVersion": "v1",
      "showPoweredBy": true,
      "theme": "prism",
      "themeColor": "#2563eb"
    });

    window.botpressWebChat.onEvent(
      function (event) {
        console.log(event);
        if (event.type === 'TRIGGER' && event.value && event.value.city) {
          renderMessages(event.value.city);
        }
      },
      ['TRIGGER']
    );
  };

  const handleButtonClick = () => {
    const inputText = document.getElementById('inputField').value;
    setMessages(prevMessages => [...prevMessages, { text: inputText, fromBot: false }]);
    document.getElementById('inputField').value = '';
    window.botpressWebChat.sendEvent({ type: "show" })
    window.botpressWebChat.sendEvent({ type: 'trigger' })
    window.botpressWebChat.sendPayload({ type: 'text', text: inputText });
  };

  const renderMessages = (message) => {
    let index = 0;
    let streamedMessage = '';

    setMessages(prevMessages => {
      if (!prevMessages.length || prevMessages[prevMessages.length - 1].text !== '') {
        return [...prevMessages, { text: '', fromBot: true }];
      }
      return prevMessages;
    });

    const interval = setInterval(() => {
      streamedMessage += message[index];

      setMessages(prevMessages => {
        let newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = { text: streamedMessage, fromBot: true };
        return newMessages;
      });

      index++;
      if (index === message.length) clearInterval(interval);
    }, 1);
  };

  return (
    <div className="bg-gray-400 h-screen text-white flex justify-center items-center">
      {!showChat ? (
        <button
          className="bg-black text-white p-4 rounded"
          onClick={() => {
            loadBotpressScript();
            setShowChat(true);
          }}
        >
          Open Chat
        </button>
      ) : (
        <div className="flex flex-col h-[98%] w-[98%] sm:h-[600px] sm:w-[800px]">
          <div className="flex items-center justify-between bg-blue-500 p-2 rounded-lg">
            <Avatar alt="Your Logo" src={logoImage} style={{ margin: '0 8px' }} />
            <h1 className="flex-grow text-center">CUSTOM UI</h1>
            <h1 className="cursor-pointer" onClick={() => setShowChat(false)}>X</h1>
          </div>
          <Box id="messageContainer" ref={messageContainerRef} sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, border: '1px solid #ccc', borderRadius: '16px', p: 2, boxShadow: 3, height: '500px', display: 'flex', flexDirection: 'column' }}>
              {messages.map((message, index) => (
                <Typography
                  key={index}
                  sx={{
                    p: 1,
                    px: 2,
                    my: 1,
                    borderRadius: '16px',
                    bgcolor: message.fromBot ? 'purple' : 'blue',
                    color: 'white',
                    width: 'fit-content',
                    alignSelf: message.fromBot ? 'flex-start' : 'flex-end',
                  }}
                >
                  {message.text}
                </Typography>
              ))}
            </Box>  
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                id="inputField"
                type="text"
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const inputText = document.getElementById('inputField').value;
                    setMessages(prevMessages => [...prevMessages, { text: inputText, fromBot: false }]);
                    document.getElementById('inputField').value = '';
                    window.botpressWebChat.sendEvent({ type: "show" });
                    window.botpressWebChat.sendEvent({ type: 'trigger' });
                    window.botpressWebChat.sendPayload({ type: 'text', text: inputText });
                  }
                }}
                sx={{ flexGrow: 1 }}
            />
            <Button 
                variant="contained"
                onClick={handleButtonClick}
                id="sayButton"
                >
                Send
            </Button>
          </Box>
        </div>
      )}
      <style>
        {`
          .bp-widget-web {
            z-index: -100!important;
            visibility: hidden;
          }
        `}
      </style>
    </div>
  );
}