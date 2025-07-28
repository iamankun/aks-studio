import { LoadingScreen } from "@/components/loading-screen"

export default function Loading() {
    return (
        <LoadingScreen
            title="An Kun Studio"
            subtitle="Chào mừng bạn đến với An Kun Studio"
            duration={3000}
            logoUrl="@public/movies.png"
        />
    )
}
