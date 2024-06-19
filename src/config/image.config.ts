export type ImageConfig = {
    //Size of thumbnails to be created
    THUMB_SIZE: Number,
    PROFILE_PIC_UPLOAD_DIRECTORY: string,
    THUMB_UPLOAD_DIRECTOY: string,
}

export const ImageConfig: ImageConfig = {
    THUMB_SIZE: 64,
    PROFILE_PIC_UPLOAD_DIRECTORY: 'images/profile-pics',
    THUMB_UPLOAD_DIRECTOY: 'images/thumbs',
}