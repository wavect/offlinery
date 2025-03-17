interface Point {
    type: "Point";
    coordinates: [number, number];
}

export class PointBuilder {
    public build(lat: number, long: number): Point {
        return {
            type: "Point",
            coordinates: [lat, long],
        };
    }
}
