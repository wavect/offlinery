
export const isDevBuild = (): boolean => {
    return process.env.NODE_ENV !== 'production'
}