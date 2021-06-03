export default class Chat{
    constructor(){
        this.showChatBox=document.querySelector('#chat-wrapper')
        this.innerHtml()
        this.chatIcon=document.querySelector('.header-chat-icon')
        this.closeChatBox=document.querySelector('.chat-title-bar-close')
        this.connection=false
        this.sumbitButton=document.querySelector('#chatForm')
        this.ChatLog=document.querySelector('#chat')
        this.chatFeild=document.querySelector('#chatField')
        this.events()
    }

    events(){
        this.closeChatBox.addEventListener('click',()=>{this.OnClosed()})
        this.chatIcon.addEventListener('click',()=>{this.onClicked()})
        this.sumbitButton.addEventListener('submit',(e)=>{
            e.preventDefault()
            let value=this.chatFeild.value
            this.chatFeild.value=""
            this.chatFeild.focus()
            this.sendMessage(value)

        })
    }


    sendMessage(value){
        this.socket.emit('MessagefromBrowser',{message:value})
        this.ChatLog.insertAdjacentHTML('beforeend',`
        <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div>
        `)

    }

    myMessages(){
        
    
    }

    displayText(data){
        this.ChatLog.insertAdjacentHTML('beforeend',`
        <div class="chat-other">
        <a href="#"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="#"><strong>${data.username}:</strong></a>
          ${data.chat}
        </div></div>
      </div>
        `)


    }

    OnClosed(){
        this.showChatBox.classList.remove('chat--visible')
    }

    onClicked(){
        this.showChatBox.classList.add('chat--visible')  
        if(!this.connection){
            this.openConnection()
         }
         this.connection=true
    }

    openConnection(){
        this.socket=io()
        this.socket.on('welcome',(data)=>{
            this.username=data.username
            this.avatar=data.avatar
        })
        this.socket.on('MessagefromServer',(data)=>{
            this.displayText(data)

        })
    }

    innerHtml(){
        this.showChatBox.innerHTML=`<div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>`
    }
}