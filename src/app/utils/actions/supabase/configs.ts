// src/utils/actions/supabase/configs.ts
'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/app/utils/supabase/server';
import { createConfig } from '@/db/queries/create';
import { deleteConfig } from '@/db/queries/delete';
import {
  getAllConfigs,
  getConfigById,
  getConfigsByUserId,
  getConfigsByUserIdAndConfigId,
} from '@/db/queries/read';
import { updateConfig } from '@/db/queries/update';
import { Config } from '@/db/schema';

/**
 * **Server action that fetches a specific configuration by its ID.**
 * This action fetches the config regardless of ownership or public status.
 * The caller should verify permissions based on the returned data (userId, isPublic).
 *
 * @param configId - The ID of the configuration to fetch.
 * @returns Promise<{
 *   success: boolean;
 *   message: string;
 *   data?: Config | null; // Returns a single config object or null
 * }>
 */
export async function getConfigByIdAction(configId: string): Promise<{
  success: boolean;
  message: string;
  data?: Config | null;
}> {
  if (!configId || configId === 'undefined') {
    return {
      success: false,
      message: 'Invalid configuration ID provided.',
      data: null,
    };
  }

  try {
    // Note: No auth check here, as public configs should be fetchable.
    // The API route or component calling this should handle authorization.
    const config = await getConfigById(configId); // Returns array or empty array

    if (!config) {
      return {
        success: false,
        message: `Configuration with ID ${configId} not found.`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Configuration fetched successfully.',
      data: config[0], // Return the single config object
    };
  } catch (error) {
    console.error(
      `[Server Action] Error fetching config by ID ${configId}:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `Error fetching configuration: ${errorMessage}`,
      data: null,
    };
  }
}

/**
 * **Server action that fetches all configurations from the database.**
 * This action does not require authentication.
 *
 * @returns Promise<{
 *   success: boolean;
 *   message: string;
 *   data?: Config[]; // Array of configuration objects
 * }>
 */
export async function getAllConfigsAction(): Promise<{
  success: boolean;
  message: string;
  data?: Config[];
}> {
  try {
    const configs = await getAllConfigs();

    return {
      success: true,
      message: 'All Configurations fetched successfully',
      data: configs,
    };
  } catch (error) {
    console.error('[Server Action] Error fetching configs:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch configurations',
    };
  }
}

/**
 * Server action to fetch configurations associated with a specific user ID.
 * Wraps the `getConfigsByUserId` database query with error handling.
 *
 * @param userId - The ID of the user whose configurations are to be fetched.
 * @returns A promise resolving to an object containing the operation's success status, a message, and optionally the fetched configurations.
 */
export async function getConfigsByUserIdAction(
  userId: string
): Promise<{ success: boolean; message: string; data?: Config[] }> {
  try {
    const configs = await getConfigsByUserId(userId);

    return {
      success: true,
      message: 'User-specific configurations fetched successfully',
      data: configs,
    };
  } catch (error) {
    console.error('[Server Action] Error fetching user configs:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch user-specific configurations',
    };
  }
}

/**
 * **Server action that fetches a specific configuration only if it belongs to the currently authenticated user.**
 *
 * @param configId - The ID of the configuration to fetch.
 * @returns Promise<{
 *   success: boolean;
 *   message: string;
 *   data?: Config | null; // Returns the config object if found and owned, otherwise null
 * }>
 */
export async function getConfigByUserIdAndConfigIdAction(
  configId: string
): Promise<{
  success: boolean;
  message: string;
  data?: Config | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      '[Server Action] Get specific config: Auth error:',
      authError
    );
    return {
      success: false,
      message: 'Authentication required to fetch user-specific configuration.',
      data: null,
    };
  }

  if (!configId) {
    return {
      success: false,
      message: 'Invalid configuration ID provided.',
      data: null,
    };
  }

  try {
    // Use the authenticated user's ID for the query
    const config = await getConfigsByUserIdAndConfigId(user.id, configId); // Returns object or undefined

    if (!config) {
      return {
        success: false,
        message: `Configuration with ID ${configId} not found for the current user.`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'User-specific configuration fetched successfully.',
      data: config, // Return the config object
    };
  } catch (error) {
    console.error(
      `[Server Action] Error fetching config by UserID ${user.id} and ConfigID ${configId}:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `Error fetching user-specific configuration: ${errorMessage}`,
      data: null,
    };
  }
}

/**
 * **Server action that saves a new configuration to the database.**
 * Fetches author name from user session.
 *
 * @param title - Configuration title (required, max 50 chars)
 * @param description - Optional configuration description (max 255 chars)
 * @param configData - Optional JSON configuration data (max 10000 chars)
 * @param isPublic - Whether the configuration is public
 * @param userId - The ID of the user saving the config
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 *   data?: Config[] - Array of created config(s) if successful
 * }>
 *
 * @throws Will redirect to /login if no valid session exists
 *
 * @example
 * const result = await saveConfig(
 *   title: "My Config",
 *   description: "Config description",
 *   configData: JSON.stringify({ key: "value" }),
 *   isPublic: false,
 *   userId: "user-id"
 * );
 */
export async function saveConfigAction(
  title: string,
  description: string | null,
  configData: string | null,
  isPublic: boolean,
  userId: string
): Promise<{ success: boolean; message: string; data?: Config[] }> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('[Server Action] Authentication error:', error);
    return {
      success: false,
      message: 'Authentication required or session invalid.',
    };
  }

  // Fetch author name from user metadata
  const authorName = user.user_metadata?.full_name || user.email || 'Anonymous';

  try {
    if (!title?.trim()) {
      return { success: false, message: 'Please enter a config title.' };
    }

    if (title.length > 50) {
      return {
        success: false,
        message: 'Title cannot exceed 50 characters.',
      };
    }

    if (description && description.length > 255) {
      return {
        success: false,
        message: 'Description cannot exceed 255 characters.',
      };
    }

    const newConfig = await createConfig(
      title,
      description,
      configData,
      authorName,
      isPublic,
      userId
    );

    if (newConfig && newConfig.length > 0) {
      revalidatePath('/profile'); // Removes cache for the profile page to ensure clean correct data being displayed
      return {
        success: true,
        message: 'Config saved successfully!',
        data: newConfig.map((config) => ({
          id: config.id,
          title: config.title,
          description: config.description,
          configData: config.configData,
          userId: config.userId,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
          authorName: config.authorName,
          isPublic: config.isPublic,
        })),
      };
    } else {
      return {
        success: false,
        message:
          'Failed to save config. Database operation might have failed or returned no data.',
      };
    }
  } catch (error) {
    console.error('[Server Action] Error saving config:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Error saving config: ${errorMessage}` };
  }
}

/**
 * **Server action that deletes an existing configuration from the database.**
 * Ensures the configuration belongs to the authenticated user before deletion.
 *
 * @param configId - ID of the configuration to delete.
 * @param userId - The ID of the user attempting the deletion (verified against session).
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 * }>
 *
 * @throws Will return { success: false, ... } if no valid session exists or deletion fails.
 *
 * @example
 * const result = await removeConfigAction("some-uuid", "user-id-from-session");
 * if (result.success) {
 *   // Deletion successful
 * }
 */
export async function removeConfigAction(
  configId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required or session invalid.',
      };
    }

    await deleteConfig(configId, user.id);
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Configuration deleted successfully',
    };
  } catch (error) {
    console.error('[Server Action] Error deleting config:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to delete configuration',
    };
  }
}

/**
 * **Server action that updates an existing configuration in the database.**
 * Automatically updates the authorName based on the current user.
 *
 * @param configId - ID of the configuration to update
 * @param updatedData - Object containing fields to update (e.g., { title?, description?, configData?, isPublic? })
 *                      NOTE: userId, authorName, createdAt, updatedAt are handled internally or ignored.
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 *   data?: Config - Updated config object if successful
 * }>
 *
 * @throws Will redirect to /login if no valid session exists
 *
 * @example
 * const result = await updateConfig(
 *   configId: "some-uuid",
 *   updatedData: { title: "New Title" }
 * );
 */
export async function updateConfigAction(
  configId: string,
  updatedData: Partial<
    Omit<Config, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'authorName'>
  >
): Promise<{ success: boolean; message: string; data: Config | null }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Server Action] Update: Authentication error:', authError);
      return {
        success: false,
        message: 'Authentication required or session invalid for update.',
        data: null,
      };
    }

    // Fetch author name from user metadata
    const authorName =
      user.user_metadata?.full_name || user.email || 'Anonymous';

    // --- Validation ---
    if (updatedData.title && !updatedData.title.trim()) {
      return { success: false, message: 'Title cannot be empty.', data: null };
    }

    if (updatedData.title && updatedData.title.length > 50) {
      return {
        success: false,
        message: 'Title cannot exceed 50 characters.',
        data: null,
      };
    }

    if (updatedData.description && updatedData.description.length > 255) {
      return {
        success: false,
        message: 'Description cannot exceed 255 characters.',
        data: null,
      };
    }

    // --- Prepare final data for DB update ---
    const dataForDb: Partial<
      Omit<Config, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    > = {
      ...updatedData,
      authorName: authorName,
    };

    // --------------------------------------

    // Call the database query function to update
    const updatedConfig = await updateConfig(configId, user.id, dataForDb);

    if (!updatedConfig || updatedConfig.length === 0) {
      return {
        success: false,
        message: 'Config not found, update failed, or user not authorized.',
        data: null,
      };
    }

    revalidatePath('/profile');
    revalidatePath(`/playground?id=${configId}`); // Revalidate the specific config page
    return {
      success: true,
      message: 'Config updated successfully!',
      data: updatedConfig[0],
    };
  } catch (error) {
    console.error('[Server Action] Error updating config:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `Error updating config: ${errorMessage}`,
      data: null,
    };
  }
}
