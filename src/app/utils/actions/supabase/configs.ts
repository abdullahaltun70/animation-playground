// src/utils/actions/supabase/configs.ts
'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/app/utils/supabase/server'; // Keep for DB operations if needed by DB functions
import { createConfig } from '@/db/queries/create';
import { deleteConfig } from '@/db/queries/delete';
import {
  getConfigById,
  getConfigsByUserId,
  getConfigsByUserIdAndConfigId,
} from '@/db/queries/read';
import { updateConfig } from '@/db/queries/update';
import { Config } from '@/db/schema';

/**
 * **Server action that fetches all public configurations from the database.**
 * Optionally excludes configurations belonging to the authenticated user if their ID is provided.
 *
 * @param authenticatedUserId - Optional ID of the authenticated user to exclude their configs.
 * @returns Promise<{
 *   success: boolean;
 *   message: string;
 *   data?: Config[]; // Array of configuration objects
 * }>
 */
export async function getAllConfigsAction(
  authenticatedUserId?: string
): Promise<{
  success: boolean;
  message: string;
  data?: Config[];
}> {
  const supabase = createClient(); // For DB query construction

  try {
    let query = (await supabase)
      .from('configs_table')
      .select(
        `
        *,
        isPublic: is_public
      `
      )
      .eq('is_public', true);

    // If an authenticated user ID is provided, add a condition to exclude their own configs
    if (authenticatedUserId) {
      query = query.neq('user_id', authenticatedUserId);
    }

    const { data: configsData, error } = await query.order('updated_at', {
      ascending: false,
    });

    if (error) {
      console.error('[Server Action] Supabase error fetching configs:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Public Configurations fetched successfully',
      data: (configsData as Config[]) || [],
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch configurations',
      data: [],
    };
  }
}

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
    const config = await getConfigById(configId);
    if (!config || config.length === 0) {
      return {
        success: false,
        message: `Configuration with ID ${configId} not found.`,
        data: null,
      };
    }
    return {
      success: true,
      message: 'Configuration fetched successfully.',
      data: config[0],
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
 * **Server action that fetches a specific configuration only if it belongs to the provided user ID.**
 *
 * @param configId - The ID of the configuration to fetch.
 * @param authenticatedUserId - The ID of the authenticated user.
 * @returns Promise<{
 *   success: boolean;
 *   message: string;
 *   data?: Config | null; // Returns the config object if found and owned, otherwise null
 * }>
 */
export async function getConfigByUserIdAndConfigIdAction(
  configId: string,
  authenticatedUserId: string
): Promise<{
  success: boolean;
  message: string;
  data?: Config | null;
}> {
  if (!authenticatedUserId) {
    // This check is crucial if this action could be called without a pre-verified user.
    // However, the API route should always provide a valid authenticatedUserId.
    return {
      success: false,
      message: 'Authenticated user ID is required.',
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
    const config = await getConfigsByUserIdAndConfigId(
      authenticatedUserId,
      configId
    );
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
      data: config,
    };
  } catch (error) {
    console.error(
      `[Server Action] Error fetching config by UserID ${authenticatedUserId} and ConfigID ${configId}:`,
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
 * **Server action that saves a new configuration to the database for a given user.**
 *
 * @param title - Configuration title (required, max 50 chars)
 * @param description - Optional configuration description (max 255 chars)
 * @param configData - Optional JSON configuration data (max 10000 chars)
 * @param isPublic - Whether the configuration is public
 * @param userId - The ID of the user saving the config.
 * @param authorName - The name of the author saving the config.
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 *   data?: Config[] - Array of created config(s) if successful
 * }>
 */
export async function saveConfigAction(
  title: string,
  description: string | null,
  configData: string | null,
  isPublic: boolean,
  userId: string,
  authorName: string
): Promise<{ success: boolean; message: string; data?: Config[] }> {
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
      revalidatePath('/profile');
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
  } catch (error: unknown) {
    console.error('[Server Action] Error saving config:', error);
    return {
      success: false,
      message: `Error saving config: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`,
    };
  }
}

/**
 * **Server action that deletes an existing configuration from the database.**
 * Ensures the configuration belongs to the authenticated user before deletion.
 *
 * @param configId - ID of the configuration to delete.
 * @param authenticatedUserId - The ID of the user attempting the deletion.
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 * }>
 */
export async function removeConfigAction(
  configId: string,
  authenticatedUserId: string
): Promise<{ success: boolean; message: string }> {
  if (!authenticatedUserId) {
    return {
      success: false,
      message: 'Authenticated user ID is required for deletion.',
    };
  }
  try {
    await deleteConfig(configId, authenticatedUserId);
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
 *
 * @param configId - ID of the configuration to update
 * @param updatedData - Object containing fields to update (e.g., { title?, description?, configData?, isPublic? })
 * @param authenticatedUserId - The ID of the user making the update.
 * @param authenticatedAuthorName - The name of the author for the update.
 *
 * @returns Promise<{
 *   success: boolean - Indicates if operation was successful
 *   message: string - Status or error message
 *   data?: Config - Updated config object if successful
 * }>
 */
export async function updateConfigAction(
  configId: string,
  updatedData: Partial<
    Omit<Config, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'authorName'>
  >,
  authenticatedUserId: string,
  authenticatedAuthorName: string
): Promise<{ success: boolean; message: string; data: Config | null }> {
  if (!authenticatedUserId) {
    return {
      success: false,
      message: 'Authenticated user ID is required for update.',
      data: null,
    };
  }
  try {
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

    const dataForDb: Partial<
      Omit<Config, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    > = {
      ...updatedData,
      authorName: authenticatedAuthorName, // Use passed author name
    };

    const updatedConfig = await updateConfig(
      configId,
      authenticatedUserId,
      dataForDb
    ); // Use passed user ID

    if (!updatedConfig || updatedConfig.length === 0) {
      return {
        success: false,
        message: 'Config not found, update failed, or user not authorized.',
        data: null,
      };
    }

    revalidatePath('/profile');
    revalidatePath(`/playground?id=${configId}`);
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
