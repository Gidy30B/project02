import { current } from '@reduxjs/toolkit';
import { eachWeekOfInterval, subDays, addDays, eachDayOfInterval, format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';


const dates = eachWeekOfInterval(
  {

  start: subDays(new Date(), 14) ,
  end: addDays(new Date(), 14),
 },
  { 
    weekStartsOn: 1
   },

).reduce((acc: Date[][], cur) => {
  const allDays = eachDayOfInterval({
    start: cur,
    end: addDays(cur, 6),
  });

  acc.push(allDays);

  return acc;

}, []); 

// console.log(dates);

export const Schedule = () => {
  return (
    <PagerView style={styles.pagerView} >
      {dates.map((week, i) => {
        return (
          <View key={i}>
            {dates.map((week, i) => {
              return (
                <View key={i}>
                  <View style={styles.row}>
                    {week.map(day => {
                      const txt = format(day, 'EEEEE');


                      return (
                        <View key={i} style={styles.cell}>
                          <Text>{day.getDate()}</Text>
                        </View>
                      );
                    })}
                  </View>
                  
                </View>
              );
            })}
          </View>
        );
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});