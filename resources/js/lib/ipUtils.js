// resources/js/lib/ipUtils.js

export function ipToLong(ip) {
    let parts = ip.split('.');
    return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
}

export function longToIp(long) {
    return (
        (long >>> 24) + '.' +
        (long >> 16 & 255) + '.' +
        (long >> 8 & 255) + '.' +
        (long & 255)
    );
}

export function isValidIp(ip) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}
