import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { sanitizeUploadFileName } from "@/lib/object-storage/contracts";
import type { ConfirmedArtifactRoom } from "@/lib/artifact-workspace/artifact-workspace";

export const ARTIFACT_BUCKET = "cbai-artifacts";

export type ArtifactCloudReceipt = {
  readonly artifactId: string;
  readonly storageObjectId: string;
  readonly storageKey: string;
  readonly scanStatus: "pending";
  readonly processingStatus: "quarantined";
};

function newId(): string {
  return crypto.randomUUID();
}

export async function uploadArtifactToQuarantine(input: {
  readonly file: File;
  readonly room: ConfirmedArtifactRoom;
  readonly locale: string;
}): Promise<ArtifactCloudReceipt> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("artifact_cloud_unconfigured");

  const { data: authData, error: authError } = await client.auth.getUser();
  const user = authData.user;
  if (authError || !user) throw new Error("artifact_auth_required");

  const artifactId = newId();
  const storageObjectId = newId();
  const safeFilename = sanitizeUploadFileName(input.file.name);
  const storageKey = `${user.id}/${artifactId}/${safeFilename}`;

  const { error: uploadError } = await client.storage
    .from(ARTIFACT_BUCKET)
    .upload(storageKey, input.file, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadError) throw new Error(`artifact_upload_failed:${uploadError.message}`);

  const { error: objectError } = await client.from("storage_objects").insert({
    id: storageObjectId,
    owner_user_id: user.id,
    organization_id: null,
    bucket: ARTIFACT_BUCKET,
    storage_key: storageKey,
    content_hash: input.room.material.checksumSha256,
    byte_size: input.file.size,
    mime_type: "application/pdf",
    visibility: "private",
    lifecycle_status: "uploaded",
    scan_status: "pending",
    idempotency_key: `artifact:${input.room.material.checksumSha256}`,
  });

  if (objectError) {
    await client.storage.from(ARTIFACT_BUCKET).remove([storageKey]);
    throw new Error(`artifact_metadata_failed:${objectError.message}`);
  }

  const { error: artifactError } = await client.from("document_artifacts").insert({
    id: artifactId,
    owner_user_id: user.id,
    storage_object_id: storageObjectId,
    bucket: ARTIFACT_BUCKET,
    storage_key: storageKey,
    original_filename: input.file.name,
    safe_filename: safeFilename,
    byte_size: input.file.size,
    mime_type: "application/pdf",
    checksum_sha256: input.room.material.checksumSha256,
    title: input.room.title,
    domain: input.room.domain,
    purpose: input.room.purpose,
    research_question: input.room.researchQuestion,
    content_locale: input.locale,
    privacy: "private",
    scan_status: "pending",
    processing_status: "quarantined",
  });

  if (artifactError) {
    await client.from("storage_objects").delete().eq("id", storageObjectId);
    await client.storage.from(ARTIFACT_BUCKET).remove([storageKey]);
    throw new Error(`artifact_record_failed:${artifactError.message}`);
  }

  return {
    artifactId,
    storageObjectId,
    storageKey,
    scanStatus: "pending",
    processingStatus: "quarantined",
  };
}

