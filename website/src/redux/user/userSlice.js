import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Initial State
const initialState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  users: [],
  error: null,
  success: false,
  message: null,
  otpPurpose: null,
};

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/create-user", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "user/verifyOTP",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/verify-otp", formData);
      console.log(response);
      const accessToken = response.data.accessToken;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const resendOTP = createAsyncThunk(
  "user/resendOTP",
  async ({ email, otpPurpose }, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/resend-otp", {
        email,
        otpPurpose,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/login", formData);
      const accessToken = response.data.accessToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/forgot-password", email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/reset-password", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const updateUserAvatar = createAsyncThunk(
  "user/updateUserAvatar",
  async (userAvatar, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/update-user-avatar", userAvatar);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateUserInformation = createAsyncThunk(
  "user/updateUserInformation",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/update-user-info", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/update-user-password", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateAddress = createAsyncThunk(
  "user/updateAddress",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/update-user-addresses", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/admin-all-users");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
//slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
      state.otpPurpose = null;
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      // ⚠️ IMPORTANT: Redux-persist ki storage bhi clear karo
      localStorage.removeItem("persist:user");
      localStorage.removeItem("persist:seller");
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.success = false;
      state.message = null;
      state.otpPurpose = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.success = action.payload?.success ?? true;
        state.user = action.payload?.data || null;
        state.otpPurpose = action.payload?.otpPurpose || null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || "Failed to load user";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
        state.otpPurpose = action.payload?.otpPurpose || null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.error || "Registration failed";
        state.user = null;
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
        state.user = action.payload?.data || null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.error || "OTP verification failed";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to resend OTP";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
        if (action.payload?.otpPurpose) {
          state.isAuthenticated = false;
          state.otpPurpose = action.payload.otpPurpose;
          state.user = null;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload?.data || null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.error || "Login failed";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      //forgot-password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
        state.otpPurpose = action.payload?.otpPurpose || null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to send reset link";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      //reset-password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload?.success ?? true;
        state.message = action.payload?.message || null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Password reset failed";
        state.success = action.payload?.success || false;
        state.message =
          action.payload?.error?.message ||
          action.payload?.message ||
          "An error occurred";
      })

      .addCase(updateUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        if (state.user) {
          state.user.avatar = action.payload.user.avatar; // ✅ Correct
        }
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Avatar post failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(updateUserInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateUserInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        if (state.user) {
          state.user = {
            ...state.user, // pehle wali user details
            ...action.payload.user, // naye updated fields
          };
        } else {
          state.user = action.payload.user; // agar pehle null tha
        }
      })
      .addCase(updateUserInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "User Update post failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;

        // ✅ Agar backend updated user deta hai to user info update kar
        if (action.payload.user) {
          state.user = {
            ...state.user,
            ...action.payload.user,
          };
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Password change failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;

        // ✅ Agar backend updated user deta hai to user info update kar
        if (action.payload.user) {
          state.user = {
            ...state.user,
            ...action.payload.user,
          };
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Address change failed";
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || "An error occurred";
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.users = action.payload.users;
      })

      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error;
        state.success = action.payload?.success || false;
        state.message = action.payload?.message || false;
      });
  },
});

export const { clearError, clearSuccess, logout } = userSlice.actions;
export default userSlice.reducer;
