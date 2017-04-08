LEAGUES = ["AUT1","BEL1","CHE1","CHL1","CHN1","ECU1","ENG1","ENG2","FRA1","FRA2","GER1","GER2","GRE1","HOL1","ISR1","ITA1","JPN1","KOR1","MAR1","MEX1","POR1","RUS1","SCO1","SPA1","TUN1","USA1","VEN1","ZAF1"]

CHECK_COLUMNS = ["season","homeTeam","homeWonLast","awayWonLast","homeWinStreak","homeLoseStreak","homeTieStreak","awayWinStreak","awayLoseStreak","awayTieStreak","homePoints","awayPoints","homeWonLastEncounter","lastEncounterWasTie","homeTeamRanksHigher","homeLastSeasonPlace","awayLastSeasonPlace"]

Y_train_columns = ["homeWin","homeDraw"]


import os
import numpy as np
import pandas as pd

from sklearn.metrics import f1_score, make_scorer, classification_report

from sklearn.tree import DecisionTreeClassifier

from sklearn.preprocessing import LabelEncoder, OneHotEncoder

from sklearn import model_selection
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier

def dummyEncode(df):
        le = LabelEncoder()
        columnsToEncode = list(df.select_dtypes(include=['category','object']))        
        for feature in columnsToEncode:            
            try:
                df[feature] = le.fit_transform(df[feature])
            except:
                print('Error encoding '+feature)
        return df



dataset = pd.read_csv('training_pred_ok.csv')

dataset["homeTeamRanksHigher"] = dataset["homePoints"] > dataset["awayPoints"]



def predict_league(leag,out):

    league = dataset.loc [ dataset["league"] == leag]

    PREDICT_ROWS =  dataset.loc [ (dataset["league"] == leag)  & (dataset["homeScore"] < 0) ]["season"].count()
    # print(PREDICT_ROWS)

    dummyEncode(league) 

    X = league[:-PREDICT_ROWS]

    PREDICT_DATA = league[-PREDICT_ROWS:]

    X_train = X[ CHECK_COLUMNS ]
    Y_train = league[ Y_train_columns ][:-PREDICT_ROWS].values
    predict = PREDICT_DATA[ CHECK_COLUMNS ]

    n_games = league["season"].count()
    home_win = league["homeWin"].sum()
    home_draw = league["homeDraw"].sum()
    home_lose = league["homeLose"].sum()
    home_win_perc = ( home_win + 0.0 ) / n_games
    home_lose_perc = ( home_lose + 0.0 ) / n_games
    home_draw_perc = ( home_draw +0.0 )/ n_games

    # print("O time da casa vence {0: .1f}% das vezes".format(100*home_win_perc))
    # print("O time da casa empata {0: .1f}% das vezes".format(100*home_draw_perc))
    # print("O time da casa perde {0: .1f}% das vezes".format(100*home_lose_perc))

    # clf = RandomForestClassifier(random_state = 99)
    # grid = GridSearchCV(clf,parameters,scoring=scorer)

    #################################
    # PREDICTION 
    #################################

    # clf = DecisionTreeClassifier()
    # # scores = cross_val_score(clf,X_train,Y_train,scoring=scorer)

    # clf.fit(X_train,Y_train)
    # pred = clf.predict(predict)

    # for p in pred:
    #     out += str(p)+'\n'
        # out += str(p[0])+','+str(p[1])+'\n'

    # return out
    
    ##################################

    seed = 77
    scoring = 'accuracy'

    # Spot Check Algorithms
    models = []
    models.append(('KNeighborsClassifier', KNeighborsClassifier()))
    models.append(('DecisionTreeClassifier', DecisionTreeClassifier()))
    models.append(('RandomForestClassifier', RandomForestClassifier()))
    # models.append(('GaussianNB', GaussianNB()))
    # models.append(('SVM', SVC()))
    # models.append(('LogisticRegression', LogisticRegression()))
    # models.append(('LinearDiscriminantAnalysis', LinearDiscriminantAnalysis()))


    # evaluate each model in turn
    results = []
    names = []
    for name, model in models:
        kfold = model_selection.KFold(n_splits=10, random_state=seed)
        cv_dataset = model_selection.cross_val_score(model, X_train, Y_train, cv=kfold, scoring=scoring)
        results.append(cv_dataset)
        names.append(name)
        msg = "%s: %f (%f)" % (name, cv_dataset.mean(), cv_dataset.std())
        print(msg)
out = ''

for L in LEAGUES:
    print(L)
    out = predict_league(L,out)

# print(out)
# text_file = open("Output.txt", "w")
# text_file.write(out)
# text_file.close()
