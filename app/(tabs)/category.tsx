import { Text, View } from 'react-native';
import { FontFamily } from '../constants/FontFamily';

export default function Category() {
  return (
    <View>
     <View>
  <Text style={{ fontSize: 40 , marginTop: 50, marginLeft: 20}}>
    Default font
  </Text>

  <Text style={{ fontFamily: FontFamily.regular, fontSize: 20 }}>
    Poppins font yyyyyyyyyyyyyyyyyyyy
  </Text>
</View>

    </View>
  );
}
