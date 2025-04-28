import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },

  pickerContainer: {
    width: '70%',
    borderRadius: 5,
    backgroundColor: 'lightgray',
    padding: 5,
    elevation: 3,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },

  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: 'black', 
    borderWidth: 1, 
    paddingVertical: 10,
    elevation: 3,
    overflow: 'hidden',
    marginTop: '18%',
    marginLeft:'2%', 
    paddingHorizontal: 15,
    ...Platform.select({
      ios: {
        maxHeight: '80%',
        width: '68%',
        alignSelf: 'left',
        marginTop: '25%'
      },
      android: {
        maxHeight: '80%',
        width: '68%',
        alignSelf: 'left',
      },
    }),
  },
  picker: {
    width: '100%',
    color: 'blue',
    backgroundColor: 'transparent',
    fontSize: 14, // Font size of the selected value
    paddingHorizontal: 10, // Add horizontal padding to the selected value
  },
  pickerButton: {
    height: 40, // Make the button taller
    // width: '100%', // Wider button (you can adjust if needed)
    // backgroundColor: '#ffffff', // Light background so it's visible
    // // borderRadius: 8, // Rounded corners
    justifyContent: 'center',
    // // alignItems: 'center',
    // alignSelf: 'center', // Center it horizontally
    // // marginVertical: 10, // Space above and below
    // // paddingHorizontal: 10, // Space inside button
  },
  
  pickerItem: {
    paddingVertical: 8, 
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: 'lightgray', 
    width: '100%',
  },
  pickerText: {
    fontSize: 14,
    // fontFamily: 'Helvetica',
  },


  container_data: {
    width: '100%',
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    // fontFamily: 'Helvetica',

  },
  container_location: {
    borderWidth:1,
    padding: 5,
    resizeMode: 'contain',
    borderRadius: 5,
    overflow: 'hidden',

  },
  container_image: {
    alignItems: 'center',
    width: '100%', 
    height: 'auto', 
    borderRadius: 5,
    overflow: 'hidden',

  },
  
  imageStyle: {
    borderWidth: 1,
    width: '100%',
    aspectRatio: 1.5, 
    resizeMode: 'contain',
  },

  container_contact: {
    alignItems: 'left',
    width: '100%',
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
  },

  textSpacing: {
    marginBottom: 10,
  },
  rowText: {
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
    // backgroundColor: '#f2f2f2',
    padding: 5,
    // fontFamily: 'Helvetica',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 11,
    // fontFamily: 'Helvetica',
  },
  column: {
    width: '25%',
    textAlign: 'center',
    fontSize: 11,
    // fontFamily: 'Helvetica',
  },

  headerText: {
    fontWeight: 'bold',
    padding: 5,
    // fontFamily: 'Helvetica',

  },
  rowText: {
    padding: 5,
    // fontFamily: 'Helvetica',

  },

  modalView: {
    flex: 1,
    marginTop: 40,
    padding:20,
    borderRadius: 5,
  },
  closeButton: {
    alignItems: "center",
    alignSelf: 'center', 
    backgroundColor: "blue",
    padding: 10,
    width: '20%',
    borderRadius: 5,
    // fontFamily: 'Helvetica',
  },
  alertButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  alertText: {
    color: 'red',
    fontSize: 14,
    // fontFamily: 'Helvetica',
  },
  boldText: {
    fontWeight: 'bold',
    // fontFamily: 'Helvetica',
  },
  pickerAndDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // fontFamily: 'Helvetica',
  },
  dotsButton: {
    fontSize:12,
    padding: 5,
    // fontFamily: 'Helvetica',
  },
  modalView_2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // fontFamily: 'Helvetica',
  },
  imageStyle_2: {
    // Style for the image
    width: '90%',
    height: '50%',
    resizeMode: 'contain',
    // fontFamily: 'Helvetica',
  },
  closeButton_image: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginTop: 25,
  },
  dotTouchable: {
    position: 'absolute',
    width: 30,
    height: 30,
    left: 179 - 15,
    top: 380 - 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  dotsButtonBackground: {
    width: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  
  dotsButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
   
  dotsButtonText: {
    fontSize: 20, 
    color: 'black', 
    fontWeight: 'bold', 
  }
});
