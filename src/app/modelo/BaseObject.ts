export interface BaseObjectInterface {

    uuid?: string,
    code?: string,
    codeType?: string,
    name?: string,
    description?: string,
    version?: number,
    lastUpdate?: Date,
    createdOn?: Date,
    activationTime?: Date,
    expirationTime?: Date,
    priority?: number,
    active?: boolean,
    status?: string,
    orden?: number,
    id?: number,
    authorId?: number,
    ownerId?: number,
    deleted?: boolean,
    deleteOn?: Date,

}

export class BaseObject implements BaseObjectInterface {
    constructor(
        public uuid = null,
        public code = null,
        public codeType = null,
        public name = null,
        public description = null,
        public version = null,
        public lastUpdate = null,
        public createdOn = null,
        public activationTime = null,
        public expirationTime = null,
        public priority = null,
        public active = null,
        public status = null,
        public orden = null,
        public id = null,
        public authorId = null,
        public ownerId = null,
        public deleted = null,
        public deleteOn = null,
    ) {
    }
}