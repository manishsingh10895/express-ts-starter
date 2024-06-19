import { sync } from 'glob'
import { union } from 'lodash'
import { Request } from 'express'
import config from '../config'
import path from 'path';
import { FindOptions, ModelOptions } from '../services/request.service';
import { Model, SortOrder, Types } from 'mongoose';
import { parallel } from 'async';
import logger from './logger';

export const globFiles = (location: string): string[] => {
    return union([], sync(location))
}

export function toObjectId(id: string) {
    if (Types.ObjectId.isValid(id)) return new Types.ObjectId(id);

    return id;
}

export function getParam(param: string, req: Request): string {
    return req.params[param] as string || req.query[param] as string;
}

/**
 * Filters out required properties from an object
 * @param obj Object to scoop out of
 * @param props properties to scoop out
 */
export function scoop(obj: any, props: string[]): any {
    let x = {};

    Object.keys(obj)
        .forEach(p => {
            if (props.includes(p)) x[p] = obj[p];
        })

    return x;
}

export function getAssetURL(_path: string) {
    let assetPath = path.normalize(path.relative(process.cwd() + '/public', _path));
    return config.API_URL + '/' + assetPath;
}

export function evaluateFindOptions(findOptions: FindOptions, model: Model<any>) {
    logger.info("helper.index.evaluateFindOptions");
    logger.info(findOptions);
    let query = findOptions.search;

    console.log("QUERY", query);

    return model.find(query)
        .sort({ [findOptions.sort.field]: findOptions.sort.order as SortOrder })
        .skip(findOptions.pagination.skip)
        .limit(findOptions.pagination.limit > 200 ? 200 : findOptions.pagination.limit)
        .populate(findOptions.populate || '')
}

export function evaluateCountedFindOptions<T, K>(findOptions: FindOptions, model: Model<any>, name = "documents"): Promise<{ count, [K: string]: T[] }> {
    let query = findOptions.search;

    return new Promise((resolve, reject) => {
        let _documents = evaluateFindOptions(findOptions, model);
        let _count = model.find(query).countDocuments();

        parallel({
            [name]: async () => {
                try {
                    let documents = await _documents;

                    return documents;
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
            count: async () => {
                try {
                    let count = await _count;

                    return count;
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            }
        }, (err, results) => {
            if (err) reject(err);

            return resolve(results as any);
        })
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

export function obscureText(text: string, start = 2, end = 4) {
    if (!text) return text;

    let length = text.length;

    let str = [];

    for (let i = 0; i < length; i++) {
        if (i < start) {
            str[i] = text.charAt(i);
            continue;
        }

        if (i > (length - end)) {
            str[i] = text.charAt(i);
            continue;
        }

        str[i] = "*";
    }

    let obs = str.join('');

    console.log("OBSCURED", obs);

    return obs;
}