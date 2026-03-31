export const shouldDisableTokenInteractions = (isEditMode: boolean, fogEditMode: boolean): boolean => {
    return isEditMode && fogEditMode;
};
