import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Room
 *
 */
export type RoomModel = runtime.Types.Result.DefaultSelection<Prisma.$RoomPayload>;
export type AggregateRoom = {
    _count: RoomCountAggregateOutputType | null;
    _avg: RoomAvgAggregateOutputType | null;
    _sum: RoomSumAggregateOutputType | null;
    _min: RoomMinAggregateOutputType | null;
    _max: RoomMaxAggregateOutputType | null;
};
export type RoomAvgAggregateOutputType = {
    maxPlayers: number | null;
    maphiaCount: number | null;
    discussionTime: number | null;
};
export type RoomSumAggregateOutputType = {
    maxPlayers: number | null;
    maphiaCount: number | null;
    discussionTime: number | null;
};
export type RoomMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    status: $Enums.RoomStatus | null;
    maxPlayers: number | null;
    maphiaCount: number | null;
    discussionTime: number | null;
    createdAt: Date | null;
};
export type RoomMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    status: $Enums.RoomStatus | null;
    maxPlayers: number | null;
    maphiaCount: number | null;
    discussionTime: number | null;
    createdAt: Date | null;
};
export type RoomCountAggregateOutputType = {
    id: number;
    code: number;
    status: number;
    maxPlayers: number;
    maphiaCount: number;
    discussionTime: number;
    createdAt: number;
    _all: number;
};
export type RoomAvgAggregateInputType = {
    maxPlayers?: true;
    maphiaCount?: true;
    discussionTime?: true;
};
export type RoomSumAggregateInputType = {
    maxPlayers?: true;
    maphiaCount?: true;
    discussionTime?: true;
};
export type RoomMinAggregateInputType = {
    id?: true;
    code?: true;
    status?: true;
    maxPlayers?: true;
    maphiaCount?: true;
    discussionTime?: true;
    createdAt?: true;
};
export type RoomMaxAggregateInputType = {
    id?: true;
    code?: true;
    status?: true;
    maxPlayers?: true;
    maphiaCount?: true;
    discussionTime?: true;
    createdAt?: true;
};
export type RoomCountAggregateInputType = {
    id?: true;
    code?: true;
    status?: true;
    maxPlayers?: true;
    maphiaCount?: true;
    discussionTime?: true;
    createdAt?: true;
    _all?: true;
};
export type RoomAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Room to aggregate.
     */
    where?: Prisma.RoomWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rooms to fetch.
     */
    orderBy?: Prisma.RoomOrderByWithRelationInput | Prisma.RoomOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.RoomWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rooms.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Rooms
    **/
    _count?: true | RoomCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: RoomAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: RoomSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RoomMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RoomMaxAggregateInputType;
};
export type GetRoomAggregateType<T extends RoomAggregateArgs> = {
    [P in keyof T & keyof AggregateRoom]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRoom[P]> : Prisma.GetScalarType<T[P], AggregateRoom[P]>;
};
export type RoomGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoomWhereInput;
    orderBy?: Prisma.RoomOrderByWithAggregationInput | Prisma.RoomOrderByWithAggregationInput[];
    by: Prisma.RoomScalarFieldEnum[] | Prisma.RoomScalarFieldEnum;
    having?: Prisma.RoomScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RoomCountAggregateInputType | true;
    _avg?: RoomAvgAggregateInputType;
    _sum?: RoomSumAggregateInputType;
    _min?: RoomMinAggregateInputType;
    _max?: RoomMaxAggregateInputType;
};
export type RoomGroupByOutputType = {
    id: string;
    code: string;
    status: $Enums.RoomStatus;
    maxPlayers: number;
    maphiaCount: number;
    discussionTime: number;
    createdAt: Date;
    _count: RoomCountAggregateOutputType | null;
    _avg: RoomAvgAggregateOutputType | null;
    _sum: RoomSumAggregateOutputType | null;
    _min: RoomMinAggregateOutputType | null;
    _max: RoomMaxAggregateOutputType | null;
};
type GetRoomGroupByPayload<T extends RoomGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RoomGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RoomGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RoomGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RoomGroupByOutputType[P]>;
}>>;
export type RoomWhereInput = {
    AND?: Prisma.RoomWhereInput | Prisma.RoomWhereInput[];
    OR?: Prisma.RoomWhereInput[];
    NOT?: Prisma.RoomWhereInput | Prisma.RoomWhereInput[];
    id?: Prisma.StringFilter<"Room"> | string;
    code?: Prisma.StringFilter<"Room"> | string;
    status?: Prisma.EnumRoomStatusFilter<"Room"> | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFilter<"Room"> | number;
    maphiaCount?: Prisma.IntFilter<"Room"> | number;
    discussionTime?: Prisma.IntFilter<"Room"> | number;
    createdAt?: Prisma.DateTimeFilter<"Room"> | Date | string;
    players?: Prisma.PlayerListRelationFilter;
};
export type RoomOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    players?: Prisma.PlayerOrderByRelationAggregateInput;
};
export type RoomWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.RoomWhereInput | Prisma.RoomWhereInput[];
    OR?: Prisma.RoomWhereInput[];
    NOT?: Prisma.RoomWhereInput | Prisma.RoomWhereInput[];
    status?: Prisma.EnumRoomStatusFilter<"Room"> | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFilter<"Room"> | number;
    maphiaCount?: Prisma.IntFilter<"Room"> | number;
    discussionTime?: Prisma.IntFilter<"Room"> | number;
    createdAt?: Prisma.DateTimeFilter<"Room"> | Date | string;
    players?: Prisma.PlayerListRelationFilter;
}, "id" | "code">;
export type RoomOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.RoomCountOrderByAggregateInput;
    _avg?: Prisma.RoomAvgOrderByAggregateInput;
    _max?: Prisma.RoomMaxOrderByAggregateInput;
    _min?: Prisma.RoomMinOrderByAggregateInput;
    _sum?: Prisma.RoomSumOrderByAggregateInput;
};
export type RoomScalarWhereWithAggregatesInput = {
    AND?: Prisma.RoomScalarWhereWithAggregatesInput | Prisma.RoomScalarWhereWithAggregatesInput[];
    OR?: Prisma.RoomScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RoomScalarWhereWithAggregatesInput | Prisma.RoomScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Room"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Room"> | string;
    status?: Prisma.EnumRoomStatusWithAggregatesFilter<"Room"> | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntWithAggregatesFilter<"Room"> | number;
    maphiaCount?: Prisma.IntWithAggregatesFilter<"Room"> | number;
    discussionTime?: Prisma.IntWithAggregatesFilter<"Room"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Room"> | Date | string;
};
export type RoomCreateInput = {
    id?: string;
    code: string;
    status?: $Enums.RoomStatus;
    maxPlayers?: number;
    maphiaCount?: number;
    discussionTime?: number;
    createdAt?: Date | string;
    players?: Prisma.PlayerCreateNestedManyWithoutRoomInput;
};
export type RoomUncheckedCreateInput = {
    id?: string;
    code: string;
    status?: $Enums.RoomStatus;
    maxPlayers?: number;
    maphiaCount?: number;
    discussionTime?: number;
    createdAt?: Date | string;
    players?: Prisma.PlayerUncheckedCreateNestedManyWithoutRoomInput;
};
export type RoomUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    players?: Prisma.PlayerUpdateManyWithoutRoomNestedInput;
};
export type RoomUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    players?: Prisma.PlayerUncheckedUpdateManyWithoutRoomNestedInput;
};
export type RoomCreateManyInput = {
    id?: string;
    code: string;
    status?: $Enums.RoomStatus;
    maxPlayers?: number;
    maphiaCount?: number;
    discussionTime?: number;
    createdAt?: Date | string;
};
export type RoomUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoomUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoomCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoomAvgOrderByAggregateInput = {
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
};
export type RoomMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoomMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoomSumOrderByAggregateInput = {
    maxPlayers?: Prisma.SortOrder;
    maphiaCount?: Prisma.SortOrder;
    discussionTime?: Prisma.SortOrder;
};
export type RoomScalarRelationFilter = {
    is?: Prisma.RoomWhereInput;
    isNot?: Prisma.RoomWhereInput;
};
export type EnumRoomStatusFieldUpdateOperationsInput = {
    set?: $Enums.RoomStatus;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type RoomCreateNestedOneWithoutPlayersInput = {
    create?: Prisma.XOR<Prisma.RoomCreateWithoutPlayersInput, Prisma.RoomUncheckedCreateWithoutPlayersInput>;
    connectOrCreate?: Prisma.RoomCreateOrConnectWithoutPlayersInput;
    connect?: Prisma.RoomWhereUniqueInput;
};
export type RoomUpdateOneRequiredWithoutPlayersNestedInput = {
    create?: Prisma.XOR<Prisma.RoomCreateWithoutPlayersInput, Prisma.RoomUncheckedCreateWithoutPlayersInput>;
    connectOrCreate?: Prisma.RoomCreateOrConnectWithoutPlayersInput;
    upsert?: Prisma.RoomUpsertWithoutPlayersInput;
    connect?: Prisma.RoomWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RoomUpdateToOneWithWhereWithoutPlayersInput, Prisma.RoomUpdateWithoutPlayersInput>, Prisma.RoomUncheckedUpdateWithoutPlayersInput>;
};
export type RoomCreateWithoutPlayersInput = {
    id?: string;
    code: string;
    status?: $Enums.RoomStatus;
    maxPlayers?: number;
    maphiaCount?: number;
    discussionTime?: number;
    createdAt?: Date | string;
};
export type RoomUncheckedCreateWithoutPlayersInput = {
    id?: string;
    code: string;
    status?: $Enums.RoomStatus;
    maxPlayers?: number;
    maphiaCount?: number;
    discussionTime?: number;
    createdAt?: Date | string;
};
export type RoomCreateOrConnectWithoutPlayersInput = {
    where: Prisma.RoomWhereUniqueInput;
    create: Prisma.XOR<Prisma.RoomCreateWithoutPlayersInput, Prisma.RoomUncheckedCreateWithoutPlayersInput>;
};
export type RoomUpsertWithoutPlayersInput = {
    update: Prisma.XOR<Prisma.RoomUpdateWithoutPlayersInput, Prisma.RoomUncheckedUpdateWithoutPlayersInput>;
    create: Prisma.XOR<Prisma.RoomCreateWithoutPlayersInput, Prisma.RoomUncheckedCreateWithoutPlayersInput>;
    where?: Prisma.RoomWhereInput;
};
export type RoomUpdateToOneWithWhereWithoutPlayersInput = {
    where?: Prisma.RoomWhereInput;
    data: Prisma.XOR<Prisma.RoomUpdateWithoutPlayersInput, Prisma.RoomUncheckedUpdateWithoutPlayersInput>;
};
export type RoomUpdateWithoutPlayersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoomUncheckedUpdateWithoutPlayersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumRoomStatusFieldUpdateOperationsInput | $Enums.RoomStatus;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    maphiaCount?: Prisma.IntFieldUpdateOperationsInput | number;
    discussionTime?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type RoomCountOutputType
 */
export type RoomCountOutputType = {
    players: number;
};
export type RoomCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    players?: boolean | RoomCountOutputTypeCountPlayersArgs;
};
/**
 * RoomCountOutputType without action
 */
export type RoomCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomCountOutputType
     */
    select?: Prisma.RoomCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * RoomCountOutputType without action
 */
export type RoomCountOutputTypeCountPlayersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerWhereInput;
};
export type RoomSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    status?: boolean;
    maxPlayers?: boolean;
    maphiaCount?: boolean;
    discussionTime?: boolean;
    createdAt?: boolean;
    players?: boolean | Prisma.Room$playersArgs<ExtArgs>;
    _count?: boolean | Prisma.RoomCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["room"]>;
export type RoomSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    status?: boolean;
    maxPlayers?: boolean;
    maphiaCount?: boolean;
    discussionTime?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["room"]>;
export type RoomSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    status?: boolean;
    maxPlayers?: boolean;
    maphiaCount?: boolean;
    discussionTime?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["room"]>;
export type RoomSelectScalar = {
    id?: boolean;
    code?: boolean;
    status?: boolean;
    maxPlayers?: boolean;
    maphiaCount?: boolean;
    discussionTime?: boolean;
    createdAt?: boolean;
};
export type RoomOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "status" | "maxPlayers" | "maphiaCount" | "discussionTime" | "createdAt", ExtArgs["result"]["room"]>;
export type RoomInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    players?: boolean | Prisma.Room$playersArgs<ExtArgs>;
    _count?: boolean | Prisma.RoomCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RoomIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RoomIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RoomPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Room";
    objects: {
        players: Prisma.$PlayerPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        status: $Enums.RoomStatus;
        maxPlayers: number;
        maphiaCount: number;
        discussionTime: number;
        createdAt: Date;
    }, ExtArgs["result"]["room"]>;
    composites: {};
};
export type RoomGetPayload<S extends boolean | null | undefined | RoomDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RoomPayload, S>;
export type RoomCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RoomFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RoomCountAggregateInputType | true;
};
export interface RoomDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Room'];
        meta: {
            name: 'Room';
        };
    };
    /**
     * Find zero or one Room that matches the filter.
     * @param {RoomFindUniqueArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoomFindUniqueArgs>(args: Prisma.SelectSubset<T, RoomFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Room that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoomFindUniqueOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoomFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RoomFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Room that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoomFindFirstArgs>(args?: Prisma.SelectSubset<T, RoomFindFirstArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Room that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoomFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RoomFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Rooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rooms
     * const rooms = await prisma.room.findMany()
     *
     * // Get first 10 Rooms
     * const rooms = await prisma.room.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const roomWithIdOnly = await prisma.room.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RoomFindManyArgs>(args?: Prisma.SelectSubset<T, RoomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Room.
     * @param {RoomCreateArgs} args - Arguments to create a Room.
     * @example
     * // Create one Room
     * const Room = await prisma.room.create({
     *   data: {
     *     // ... data to create a Room
     *   }
     * })
     *
     */
    create<T extends RoomCreateArgs>(args: Prisma.SelectSubset<T, RoomCreateArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Rooms.
     * @param {RoomCreateManyArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RoomCreateManyArgs>(args?: Prisma.SelectSubset<T, RoomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Rooms and returns the data saved in the database.
     * @param {RoomCreateManyAndReturnArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Rooms and only return the `id`
     * const roomWithIdOnly = await prisma.room.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RoomCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RoomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Room.
     * @param {RoomDeleteArgs} args - Arguments to delete one Room.
     * @example
     * // Delete one Room
     * const Room = await prisma.room.delete({
     *   where: {
     *     // ... filter to delete one Room
     *   }
     * })
     *
     */
    delete<T extends RoomDeleteArgs>(args: Prisma.SelectSubset<T, RoomDeleteArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Room.
     * @param {RoomUpdateArgs} args - Arguments to update one Room.
     * @example
     * // Update one Room
     * const room = await prisma.room.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RoomUpdateArgs>(args: Prisma.SelectSubset<T, RoomUpdateArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Rooms.
     * @param {RoomDeleteManyArgs} args - Arguments to filter Rooms to delete.
     * @example
     * // Delete a few Rooms
     * const { count } = await prisma.room.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RoomDeleteManyArgs>(args?: Prisma.SelectSubset<T, RoomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RoomUpdateManyArgs>(args: Prisma.SelectSubset<T, RoomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Rooms and returns the data updated in the database.
     * @param {RoomUpdateManyAndReturnArgs} args - Arguments to update many Rooms.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Rooms and only return the `id`
     * const roomWithIdOnly = await prisma.room.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends RoomUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RoomUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Room.
     * @param {RoomUpsertArgs} args - Arguments to update or create a Room.
     * @example
     * // Update or create a Room
     * const room = await prisma.room.upsert({
     *   create: {
     *     // ... data to create a Room
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Room we want to update
     *   }
     * })
     */
    upsert<T extends RoomUpsertArgs>(args: Prisma.SelectSubset<T, RoomUpsertArgs<ExtArgs>>): Prisma.Prisma__RoomClient<runtime.Types.Result.GetResult<Prisma.$RoomPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomCountArgs} args - Arguments to filter Rooms to count.
     * @example
     * // Count the number of Rooms
     * const count = await prisma.room.count({
     *   where: {
     *     // ... the filter for the Rooms we want to count
     *   }
     * })
    **/
    count<T extends RoomCountArgs>(args?: Prisma.Subset<T, RoomCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RoomCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoomAggregateArgs>(args: Prisma.Subset<T, RoomAggregateArgs>): Prisma.PrismaPromise<GetRoomAggregateType<T>>;
    /**
     * Group by Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends RoomGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RoomGroupByArgs['orderBy'];
    } : {
        orderBy?: RoomGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RoomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Room model
     */
    readonly fields: RoomFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Room.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__RoomClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    players<T extends Prisma.Room$playersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Room$playersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Room model
 */
export interface RoomFieldRefs {
    readonly id: Prisma.FieldRef<"Room", 'String'>;
    readonly code: Prisma.FieldRef<"Room", 'String'>;
    readonly status: Prisma.FieldRef<"Room", 'RoomStatus'>;
    readonly maxPlayers: Prisma.FieldRef<"Room", 'Int'>;
    readonly maphiaCount: Prisma.FieldRef<"Room", 'Int'>;
    readonly discussionTime: Prisma.FieldRef<"Room", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"Room", 'DateTime'>;
}
/**
 * Room findUnique
 */
export type RoomFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter, which Room to fetch.
     */
    where: Prisma.RoomWhereUniqueInput;
};
/**
 * Room findUniqueOrThrow
 */
export type RoomFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter, which Room to fetch.
     */
    where: Prisma.RoomWhereUniqueInput;
};
/**
 * Room findFirst
 */
export type RoomFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter, which Room to fetch.
     */
    where?: Prisma.RoomWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rooms to fetch.
     */
    orderBy?: Prisma.RoomOrderByWithRelationInput | Prisma.RoomOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Rooms.
     */
    cursor?: Prisma.RoomWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rooms.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Rooms.
     */
    distinct?: Prisma.RoomScalarFieldEnum | Prisma.RoomScalarFieldEnum[];
};
/**
 * Room findFirstOrThrow
 */
export type RoomFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter, which Room to fetch.
     */
    where?: Prisma.RoomWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rooms to fetch.
     */
    orderBy?: Prisma.RoomOrderByWithRelationInput | Prisma.RoomOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Rooms.
     */
    cursor?: Prisma.RoomWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rooms.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Rooms.
     */
    distinct?: Prisma.RoomScalarFieldEnum | Prisma.RoomScalarFieldEnum[];
};
/**
 * Room findMany
 */
export type RoomFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter, which Rooms to fetch.
     */
    where?: Prisma.RoomWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rooms to fetch.
     */
    orderBy?: Prisma.RoomOrderByWithRelationInput | Prisma.RoomOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Rooms.
     */
    cursor?: Prisma.RoomWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rooms from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rooms.
     */
    skip?: number;
    distinct?: Prisma.RoomScalarFieldEnum | Prisma.RoomScalarFieldEnum[];
};
/**
 * Room create
 */
export type RoomCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * The data needed to create a Room.
     */
    data: Prisma.XOR<Prisma.RoomCreateInput, Prisma.RoomUncheckedCreateInput>;
};
/**
 * Room createMany
 */
export type RoomCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rooms.
     */
    data: Prisma.RoomCreateManyInput | Prisma.RoomCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Room createManyAndReturn
 */
export type RoomCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * The data used to create many Rooms.
     */
    data: Prisma.RoomCreateManyInput | Prisma.RoomCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Room update
 */
export type RoomUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * The data needed to update a Room.
     */
    data: Prisma.XOR<Prisma.RoomUpdateInput, Prisma.RoomUncheckedUpdateInput>;
    /**
     * Choose, which Room to update.
     */
    where: Prisma.RoomWhereUniqueInput;
};
/**
 * Room updateMany
 */
export type RoomUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Rooms.
     */
    data: Prisma.XOR<Prisma.RoomUpdateManyMutationInput, Prisma.RoomUncheckedUpdateManyInput>;
    /**
     * Filter which Rooms to update
     */
    where?: Prisma.RoomWhereInput;
    /**
     * Limit how many Rooms to update.
     */
    limit?: number;
};
/**
 * Room updateManyAndReturn
 */
export type RoomUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * The data used to update Rooms.
     */
    data: Prisma.XOR<Prisma.RoomUpdateManyMutationInput, Prisma.RoomUncheckedUpdateManyInput>;
    /**
     * Filter which Rooms to update
     */
    where?: Prisma.RoomWhereInput;
    /**
     * Limit how many Rooms to update.
     */
    limit?: number;
};
/**
 * Room upsert
 */
export type RoomUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * The filter to search for the Room to update in case it exists.
     */
    where: Prisma.RoomWhereUniqueInput;
    /**
     * In case the Room found by the `where` argument doesn't exist, create a new Room with this data.
     */
    create: Prisma.XOR<Prisma.RoomCreateInput, Prisma.RoomUncheckedCreateInput>;
    /**
     * In case the Room was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.RoomUpdateInput, Prisma.RoomUncheckedUpdateInput>;
};
/**
 * Room delete
 */
export type RoomDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
    /**
     * Filter which Room to delete.
     */
    where: Prisma.RoomWhereUniqueInput;
};
/**
 * Room deleteMany
 */
export type RoomDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Rooms to delete
     */
    where?: Prisma.RoomWhereInput;
    /**
     * Limit how many Rooms to delete.
     */
    limit?: number;
};
/**
 * Room.players
 */
export type Room$playersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: Prisma.PlayerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Player
     */
    omit?: Prisma.PlayerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerInclude<ExtArgs> | null;
    where?: Prisma.PlayerWhereInput;
    orderBy?: Prisma.PlayerOrderByWithRelationInput | Prisma.PlayerOrderByWithRelationInput[];
    cursor?: Prisma.PlayerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlayerScalarFieldEnum | Prisma.PlayerScalarFieldEnum[];
};
/**
 * Room without action
 */
export type RoomDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Room
     */
    select?: Prisma.RoomSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Room
     */
    omit?: Prisma.RoomOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoomInclude<ExtArgs> | null;
};
export {};
