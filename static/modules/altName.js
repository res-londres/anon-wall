
import { userProfile } from "./userProfile";

export function getAltNames() {
    return userProfile.alt_names || [];
}

export function addAltName(altName) {
    if (!userProfile.alt_names) {
        userProfile.alt_names = [];
    }
    userProfile.alt_names.push(altName);
}