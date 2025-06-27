import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import Loading from "../components/Loading";

const index = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Loading />
      <Text>Przygotowywujemy aplikację, prosimy o cierpliwość</Text>
    </View>
  );
};

export default index;
