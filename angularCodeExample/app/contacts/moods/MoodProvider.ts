export class MoodProvider{
    private static instance: MoodProvider;

    public static getInstance(): MoodProvider {
        if (!MoodProvider.instance) {
            MoodProvider.instance = new MoodProvider();
        }
        return MoodProvider.instance;
    }

    private constructor() {}

    private moods:any[] = [
        {value:-1, text:"Unset", img:"assets/images/moods/notSet.png"},
        {value:0, text:"Sorrow", img:"assets/images/moods/sorrow.png"},
        {value:1, text:"Upset", img:"assets/images/moods/upset.png"},
        {value:2, text:"Calm", img:"assets/images/moods/calm.png"},
        {value:3, text:"Joyfull", img:"assets/images/moods/joyfull.png"},
        {value:4, text:"Happy", img:"assets/images/moods/happy.png"},
    ];

    public getMood(value:number):any{
        const filtered:any[] = this.moods.filter(mood=>mood.value==value);
        if(filtered && filtered.length > 0){
            return filtered[0];
        }
        else{
            return null
        }
    }
    
    public getMoods():any[]{
        return this.moods;
    }
}
