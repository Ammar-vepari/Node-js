import Search from './modules/search'
import Chat from './modules/chat'

if(document.querySelector('.header-chat-icon')){
    new Chat()
}

if(document.querySelector(".header-search-icon")){
    new Search()
}
