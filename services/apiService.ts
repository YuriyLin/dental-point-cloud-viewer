/**
 * API Service for Dental Segmentation
 * 
 * Communicates with the FastAPI backend to:
 * - Upload STL files
 * - Trigger AI segmentation
 * - Retrieve download URLs for processed PLY files
 */

import { AnalysisResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Extended response type from enhanced backend
export interface SegmentationResult extends AnalysisResponse {
    task_id: string;
    download_url: string;
    metadata_url: string;
    mesh_url?: string;
    has_mesh: boolean;
    jaw_type?: 'upper' | 'lower';
    num_points?: number;
    teeth?: Array<{
        fdi: number;
        name: string;
        point_count: number;
        percentage: number;
    }>;
}

/**
 * Upload and segment an STL file
 * 
 * This function handles the complete flow:
 * 1. Upload the file to /api/upload
 * 2. Trigger segmentation at /api/segment/{task_id}
 * 3. Return the results with download URLs
 */
export type JawType = 'auto' | 'upper' | 'lower';

export const segmentSTL = async (file: File, jawType: JawType = 'auto'): Promise<SegmentationResult> => {
    // Step 1: Upload the file
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
    });

    if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
    }

    const { task_id } = await uploadRes.json();

    // Step 2: Run segmentation (fast mode without mesh generation)
    const query = jawType === 'auto' ? '' : `?jaw_type=${jawType}`;
    const segmentRes = await fetch(`${API_BASE_URL}/api/segment/${task_id}${query}`, {
        method: "POST",
    });

    if (!segmentRes.ok) {
        const errorData = await segmentRes.json().catch(() => ({}));
        throw new Error(errorData.detail || "Segmentation failed");
    }

    const data = await segmentRes.json();

    // Return formatted response with absolute URLs
    return {
        task_id: data.task_id,
        summary: data.summary,
        results: data.results,
        teeth: data.teeth,
        download_url: `${API_BASE_URL}${data.download_url}`,
        metadata_url: `${API_BASE_URL}${data.metadata_url}`,
        mesh_url: data.mesh_url ? `${API_BASE_URL}${data.mesh_url}` : undefined,
        has_mesh: data.has_mesh || false,
        jaw_type: data.jaw_type,
        num_points: data.num_points,
    };
};

/**
 * Check API health status
 */
export const checkHealth = async (): Promise<{ status: string; model_loaded: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) {
        throw new Error("Health check failed");
    }
    return res.json();
};

/**
 * Fetch metadata for a processed task
 * Used by the Three.js viewer for raycasting
 */
export const fetchMetadata = async (taskId: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/api/metadata/${taskId}`);
    if (!res.ok) {
        throw new Error("Failed to fetch metadata");
    }
    return res.json();
};

/**
 * Generate heavy 3D mesh with graphcut
 */
export const generateMesh = async (taskId: string): Promise<{ mesh_url: string, metadata_url: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/generate_mesh/${taskId}`, {
        method: "POST"
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Generating mesh failed");
    }
    const data = await res.json();
    return {
        mesh_url: `${API_BASE_URL}${data.mesh_url}`,
        metadata_url: `${API_BASE_URL}${data.metadata_url}`
    };
};
