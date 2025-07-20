import type {
  ApiResponse,
  ListRequest,
  PaginatedResponse,
} from "../../types/api";
import type { CreateUserInput, UpdateUserInput, User } from "../../types/user";
import {
  createItemCacheTags,
  createItemInvalidationTags,
  createListCacheTags,
  createListInvalidationTags,
  createQueryString,
} from "./apiUtils";
import { baseApi, transformResponse } from "./baseApi";

// Request/Response types specific to users API
export interface GetUserByIdRequest {
  id: string;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface GetAllUsersRequest extends ListRequest {
  role?: "customer" | "worker" | "admin";
  status?: "active" | "inactive";
  workingStatus?: "Free" | "Busy"; // For workers
}

export interface UpdateUserRequest {
  id: string;
  data: UpdateUserInput;
}

export interface CreateUserRequest {
  data: CreateUserInput;
}

// Users API slice
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user by ID
    getUserById: builder.query<User, GetUserByIdRequest>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      providesTags: (result, _error, { id }) =>
        result ? createItemCacheTags("User", id) : [],
    }),

    // Get user by email (legacy compatibility)
    getUserByEmail: builder.query<User, GetUserByEmailRequest>({
      query: ({ email }) => ({
        url: `/users`,
        method: "GET",
        params: { email },
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      providesTags: (result) =>
        result ? createItemCacheTags("User", result.id) : [],
    }),

    // Get all users with filtering and pagination
    getAllUsers: builder.query<
      { data: User[]; pagination: PaginatedResponse<User>["pagination"] },
      GetAllUsersRequest
    >({
      query: (params) => {
        const queryString = createQueryString(params);
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: PaginatedResponse<User>) => ({
        data: transformResponse(response),
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? createListCacheTags("User", result.data)
          : [{ type: "User" as any, id: "LIST" }],
    }),

    // Get all customers
    getAllCustomers: builder.query<
      { data: User[]; pagination: PaginatedResponse<User>["pagination"] },
      Omit<GetAllUsersRequest, "role">
    >({
      query: (params) => {
        const queryString = createQueryString({ ...params, role: "customer" });
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: PaginatedResponse<User>) => ({
        data: transformResponse(response),
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? createListCacheTags("Customer", result.data)
          : [{ type: "Customer" as any, id: "LIST" }],
    }),

    // Get all workers
    getAllWorkers: builder.query<
      { data: User[]; pagination: PaginatedResponse<User>["pagination"] },
      Omit<GetAllUsersRequest, "role">
    >({
      query: (params) => {
        const queryString = createQueryString({ ...params, role: "worker" });
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: PaginatedResponse<User>) => ({
        data: transformResponse(response),
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? createListCacheTags("Worker", result.data)
          : [{ type: "Worker" as any, id: "LIST" }],
    }),

    // Get available workers (Free status)
    getAvailableWorkers: builder.query<
      { data: User[]; pagination: PaginatedResponse<User>["pagination"] },
      Omit<GetAllUsersRequest, "role" | "workingStatus">
    >({
      query: (params) => {
        const queryString = createQueryString({
          ...params,
          role: "worker",
          workingStatus: "Free",
        });
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: PaginatedResponse<User>) => ({
        data: transformResponse(response),
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? createListCacheTags("Worker", result.data)
          : [{ type: "Worker" as any, id: "LIST" }],
    }),

    // Get busy workers (Busy status)
    getBusyWorkers: builder.query<
      { data: User[]; pagination: PaginatedResponse<User>["pagination"] },
      Omit<GetAllUsersRequest, "role" | "workingStatus">
    >({
      query: (params) => {
        const queryString = createQueryString({
          ...params,
          role: "worker",
          workingStatus: "Busy",
        });
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: PaginatedResponse<User>) => ({
        data: transformResponse(response),
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? createListCacheTags("Worker", result.data)
          : [{ type: "Worker" as any, id: "LIST" }],
    }),

    // Create new user
    createUser: builder.mutation<User, CreateUserRequest>({
      query: ({ data }) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      invalidatesTags: (result) =>
        result
          ? [
              ...createListInvalidationTags("User"),
              ...createListInvalidationTags("Customer"),
              ...createListInvalidationTags("Worker"),
            ]
          : [],
    }),

    // Update user
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [
              ...createItemInvalidationTags("User", id),
              ...createListInvalidationTags("Customer"),
              ...createListInvalidationTags("Worker"),
            ]
          : [],
    }),

    // Update user working status (for workers)
    updateWorkerStatus: builder.mutation<
      User,
      { id: string; workingStatus: "Free" | "Busy" }
    >({
      query: ({ id, workingStatus }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { workingStatus },
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [
              ...createItemInvalidationTags("User", id),
              ...createItemInvalidationTags("Worker", id),
            ]
          : [],
    }),

    // Delete user (soft delete)
    deleteUser: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) =>
        transformResponse(response),
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [
              ...createItemInvalidationTags("User", id),
              ...createListInvalidationTags("Customer"),
              ...createListInvalidationTags("Worker"),
            ]
          : [],
    }),

    // Make user admin
    makeAdmin: builder.mutation<User, { id: string }>({
      query: ({ id }) => ({
        url: `/users/${id}/make-admin`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      invalidatesTags: (result, _error, { id }) =>
        result
          ? [
              ...createItemInvalidationTags("User", id),
              { type: "Admin" as any, id: "LIST" },
            ]
          : [],
    }),

    // Get user profile (current user)
    getUserProfile: builder.query<User, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      providesTags: (result) =>
        result ? [{ type: "UserProfile" as any, id: result.id }] : [],
    }),

    // Update user profile (current user)
    updateUserProfile: builder.mutation<User, { data: UpdateUserInput }>({
      query: ({ data }) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformResponse(response),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "UserProfile" as any, id: result.id },
              ...createItemInvalidationTags("User", result.id),
            ]
          : [],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetUserByEmailQuery,
  useGetAllUsersQuery,
  useGetAllCustomersQuery,
  useGetAllWorkersQuery,
  useGetAvailableWorkersQuery,
  useGetBusyWorkersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateWorkerStatusMutation,
  useDeleteUserMutation,
  useMakeAdminMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = usersApi;

export const {
  getUserById,
  getUserByEmail,
  getAllUsers,
  getAllCustomers,
  getAllWorkers,
  getAvailableWorkers,
  getBusyWorkers,
  createUser,
  updateUser,
  updateWorkerStatus,
  deleteUser,
  makeAdmin,
  getUserProfile,
  updateUserProfile,
} = usersApi.endpoints;
