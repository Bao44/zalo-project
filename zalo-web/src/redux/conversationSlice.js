import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    getAllConversations: (state, action) => {
      state.conversations = action.payload;
    },
    createConversation: (state, action) => {
      state.conversations.push(action.payload);
    },
    deleteConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.payload,
      );
    },
    removeYourself: (state, action) => {
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.payload,
      );
    },
    assignAdmin: (state, action) => {
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            admin: action.payload.userId,
          };
        }
        return conversation;
      });
    },
    removeUser: (state, action) => {
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            members: conversation.members.filter((mem) => mem.id !== action.payload.userId),
          };
        }
        return conversation;
      });
    },
    addUser: (state, action) => {
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            members: [...conversation.members, action.payload.user],
          };
        }
        return conversation;
      });
    },
  },
});

export const {
  getAllConversations,
  createConversation,
  deleteConversation,
  removeUser,
  assignAdmin,
  addUser,
  removeYourself,
} = conversationSlice.actions;

export default conversationSlice.reducer;
