"use server"

import {
    BUCKET_ID,
    DATABASE_ID,
    databases,
    ENDPOINT,
    PATIENT_COLLECTION_ID, PROJECT_ID,
    storage,
    users
} from "@/lib/appwrite.config";
import {ID, Query} from "node-appwrite";
import {parseStringify} from "@/lib/utils";
import {InputFile} from "node-appwrite/file";

export const createUser = async (user: CreateUserParams) => {
    try {
        const newUser = await users.create(
            ID.unique(),
            user.email,
            user.phone,
            undefined,
            user.name
        )

        return parseStringify(newUser)
    } catch (error) {
        if (error && error?.code === 409) {
            const documents = await users.list([
                Query.equal('email', [user.email]),
            ])
            return documents?.users[0]
        }
    }
}

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId);

        return parseStringify(user);
    } catch (error) {
        console.error(
            "An error occurred while retrieving the user details:",
            error
        );
    }
};

export const registerPatient = async ({identificationDocument, ...patient}: RegisterUserParams) => {
    try {
        let file;

        if (identificationDocument) {
            const inputFIle = InputFile.fromBuffer(
                identificationDocument?.get('blobFile') as Blob,
                identificationDocument?.get('fileName') as string,);

            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFIle);
        }

        const newPatient = await databases.createDocument(
            DATABASE_ID,
            PATIENT_COLLECTION_ID,
            ID.unique(),
            {
                ...patient,
                identificationDocumentId: file?.$id,
                identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
            }
        );

        return parseStringify(newPatient);
    } catch (error) {
        console.error("An error occurred while registering the patient:", error)
    }
}

export const getPatient = async (userId: string) => {
    try {
        const patients = await databases.listDocuments(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            [Query.equal("userId", [userId])]
        );

        return parseStringify(patients.documents[0]);
    } catch (error) {
        console.error(
            "An error occurred while retrieving the patient details:",
            error
        );
    }
};
