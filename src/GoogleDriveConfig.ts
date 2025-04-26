// src/config/GoogleDriveConfig.ts
export class GoogleDriveConfig {
    private static instance: GoogleDriveConfig;
    private constructor(
        public clientId: string,
        public redirectUri: string,
        public maxFileSize: number,
        public allowedFormats: string[]
    ) {}

    public static getInstance(
        clientId: string,
        redirectUri: string,
        maxFileSize: number,
        allowedFormats: string[]
    ): GoogleDriveConfig {
        if (!GoogleDriveConfig.instance) {
            GoogleDriveConfig.instance = new GoogleDriveConfig(
                clientId,
                redirectUri,
                maxFileSize,
                allowedFormats
            );
        }
        return GoogleDriveConfig.instance;
    }
}

export type GoogleDriveConfiguration = {
    clientId: string;
    redirectUri: string;
    maxFileSize: number;
    allowedFormats: string[];
};
