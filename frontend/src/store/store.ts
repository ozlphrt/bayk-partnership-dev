import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import memberSlice from './slices/memberSlice';
import partnerSlice from './slices/partnerSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    member: memberSlice,
    partner: partnerSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
