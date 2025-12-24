export declare const RoomStatus: {
    readonly LOBBY: "LOBBY";
    readonly ROLE_REVEAL: "ROLE_REVEAL";
    readonly DISCUSSION: "DISCUSSION";
    readonly VOTING: "VOTING";
    readonly NIGHT: "NIGHT";
    readonly FINISHED: "FINISHED";
};
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];
export declare const Role: {
    readonly PENDING: "PENDING";
    readonly CIVILIAN: "CIVILIAN";
    readonly MAPHIA: "MAPHIA";
};
export type Role = (typeof Role)[keyof typeof Role];
