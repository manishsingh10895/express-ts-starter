import Sharp from 'sharp';
import * as path from 'path';
import Config from '../config';

export default class ImageOptimization {
    public static async createThumbnail(name: string, imagePath: string) {
        let ext = path.extname(name);

        name = name.replace(ext, '');

        let savepath = path.resolve(process.cwd() + '/public/' + Config.IMAGE.THUMB_UPLOAD_DIRECTOY + `/${name}.png`);

        return await Sharp(imagePath)
            .resize(320, 320, {
                fit: 'contain',
            })
            .png()
            .toFile(savepath)
            .then((data) => {
                return {
                    path: savepath,
                }
            })
    }
}