export default class Utils {

    public static kFormat(num: number): string {
        return num > 999 ? (num/1000).toFixed(0) + 'k' : num.toString();
    }

}