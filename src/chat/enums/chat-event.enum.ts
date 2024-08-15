
export enum ChatEvent {
    ERROR = 'ERROR',
    ERROR_DUPLICATE_CHAT = 'ERROR_DUPLICATE_CHAT',
    CREATE_CHAT = 'CREAT_CHAT',
    RECEIVED_CREATE_CHAT = 'RECEIVED_CREATE_CHAT',
    JOIN_CHATS = 'JOIN_CHATS',
    RECEIVED_JOIN_CHATS = 'RECEIVED_JOIN_CHATS',
    SEND_MESSAGE = 'SEND_MESSAGE',
    RECEIVED_MESSAGE = 'RECEIVED_MESSAGE',
    GET_PAGINATION_MESSAGE = 'GET_PAGINATION_MESSAGE',
    RECEIVED_PAGINATION_MESSAGE = 'RECEIVED_PAGINATION_MESSAGE',
    CREATE_MESSAGE_READER = 'CREATE_MESSAGE_READER'
}