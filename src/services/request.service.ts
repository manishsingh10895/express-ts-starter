import { Request } from "express";
import logger from "../helpers/logger";
import { Types } from 'mongoose';

export type FindOptions = {
    sort?: { order: number, field: string },
    search?: { [name: string]: string | any },
    populate?: string,
    pagination?: { skip: number, limit: number }
}

export type ModelOptions = {
    populate?: string
}
class RequestService {
    parseFindOptions(req: Request, _default: FindOptions): FindOptions {
        logger.info("request.service.parseFindOptions");

        try {

            let _query = (req.query.query as string[] || []).map(q => JSON.parse(q));

            logger.info(_default);
            if (_default.search) {
                Object.keys(_default.search).forEach((k) => {
                    let searchvalue = _default.search[k];

                    if (typeof searchvalue === 'string') {
                        // searchvalue = `"${searchvalue}"`;
                    }

                    //query elements should be parseable JSON
                    let item = {
                        field: k,
                        search: searchvalue
                    }

                    if (!_query.filter(q => q.field == k).length) {
                        _query.push(item);
                    }
                })
            }

            let query: any = {};

            if (typeof _query == 'object' && _query.constructor == Array) {
                _query.forEach(q => {
                    // q = JSON.parse(q);

                    let search = q.search;

                    if (search == 'false' || search == 'true') {
                        if (search == 'false') search = false;
                        if (search == 'true') search = true;
                    }
                    else if (search && (search.from || search.to)) {
                        search = {
                            $gte: search.from,
                            $lte: search.to
                        }
                    }
                    else if (search && typeof search == 'string' && search !== "") {
                        search = new RegExp(q.search, 'i');
                    }

                    //If searching for an object, remove regex search
                    // as it will throw castToObject error 
                    if (Types.ObjectId.isValid(q.search)) {
                        search = q.search;
                    }

                    query[q.field] = search;
                });
            }

            let sort: string = (req.query.sort as string) || _default.sort && _default.sort.field;
            let order: number = (parseInt(req.query.sortOrder as string) as number) || _default.sort && _default.sort.order;

            let skip = parseInt(req.query.skip as string) || _default.pagination && _default.pagination.skip || 0;
            let limit = parseInt(req.query.limit as string) || _default.pagination && _default.pagination.limit || 0;

            return {
                search: query,
                sort: sort ? { field: sort, order: order } : null,
                pagination: { skip, limit },
                populate: _default.populate || ''
            };
        } catch (err) {
            logger.error(err);
            return {};
        }
    }
}

export default new RequestService();