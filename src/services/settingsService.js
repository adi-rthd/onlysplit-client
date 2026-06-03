import client from '../api/client';
// src/services/settingsclient.js

// ─────────────────────────────────────────────
// GET CURRENT USER PROFILE
// ─────────────────────────────────────────────

export const getProfile = async () => {
    const response = await client.get('/auth/me');

    return response?.data?.data;
};

// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────

export const updateProfile = async (payload) => {
    try {
        await client.put('/auth/profile', payload);

        toast.success('Profile updated successfully.');
    } catch (error) {
        handleApiError(
            error,
            'Failed to update profile'
        );
    }
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────

export const changePassword = async (payload) => {
    const response = await client.put(
        '/auth/change-password',
        payload
    );

    return response?.data?.data;
};

// ─────────────────────────────────────────────
// UPDATE NOTIFICATION SETTINGS
// ─────────────────────────────────────────────

export const updateNotificationSettings = async (
    payload
) => {
    const response = await client.put(
        '/auth/preferences/notifications',
        payload
    );

    return response?.data?.data;
};

// ─────────────────────────────────────────────
// UPDATE SECURITY SETTINGS
// ─────────────────────────────────────────────

export const updateSecuritySettings = async (
    payload
) => {
    const response = await client.put(
        '/auth/preferences/security',
        payload
    );

    return response?.data?.data;
};