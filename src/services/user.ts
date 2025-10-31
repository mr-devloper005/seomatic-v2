import type {
  UsersApiResponse,
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserResponse,
  DeleteMultipleUsersResponse,
  ApiError,
} from "@/types/user";
import { getApiUrl, API_CONFIG } from "@/config/api";
import { StorageService } from "@/lib/storage";

export class UserService {
  private static getAuthHeaders() {
    const token = StorageService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getUsers(
    page: number = 1,
    perPage: number = 10,
    query?: string
  ): Promise<UsersApiResponse> {
    try {
      const params = new URLSearchParams({
        p: page.toString(),
        n: perPage.toString(),
      });

      if (query && query.trim()) {
        params.append("q", query.trim());
      }

      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}?${params}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: data.success ?? true,
        data: data.data ?? data.users ?? [],
        page: data.page ?? page,
        perPage: data.perPage ?? perPage,
        totalPages:
          data.totalPages ?? data.pages ?? Math.ceil((data.totalUsers ?? data.total ?? 0) / (perPage || 10)),
        totalUsers: data.totalUsers ?? data.total ?? 0,
      };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : "Failed to fetch users",
      };
      throw apiError;
    }
  }

  static async createUser(data: CreateUserRequest): Promise<UserApiResponse> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USERS), {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to create user");
      }

      return result;
    } catch (error: any) {
      throw {
        message: error?.message || "Failed to create user",
      } as ApiError;
    }
  }

  static async updateUser(
    id: string | number,
    data: UpdateUserRequest
  ): Promise<UserApiResponse> {
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to update user");
      }

      return result;
    } catch (error: any) {
      throw {
        message: error?.message || "Failed to update user",
      } as ApiError;
    }
  }

  static async deleteUser(id: string | number): Promise<DeleteUserResponse> {
    try {
      const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.USERS)}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as DeleteUserResponse;
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : "Failed to delete user",
      } as ApiError;
    }
  }

  static async deleteMultipleUsers(
    ids: string[]
  ): Promise<DeleteMultipleUsersResponse> {
    try {
      const results = await Promise.allSettled(ids.map((id) => this.deleteUser(id)));

      const deletedCount = results.filter((res) => res.status === "fulfilled").length;
      const failedCount = results.length - deletedCount;

      if (failedCount > 0) {
        throw new Error(`Failed to delete ${failedCount} of ${ids.length} users`);
      }

      return {
        success: true,
        message: "Deleted selected users",
        data: {
          deletedCount,
          requestedCount: ids.length,
          notFoundCount: 0,
        },
      };
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : "Failed to delete users",
      } as ApiError;
    }
  }
}
