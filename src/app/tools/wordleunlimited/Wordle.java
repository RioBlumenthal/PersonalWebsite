
public class Wordle {
    private String secretWord;

    public void run() {
        this.setSecretWord();
        gw = new WordleGWindow(this);
        // gw.showMessage("The secret word is " + secretWord);
        gw.addEnterListener((s) -> enterAction(s));
    }

    /*
     * Called when the user hits the RETURN key or clicks the ENTER button,
     * passing in the string of characters on the current row.
     */

    public String getSecretWord() {
        return this.secretWord;
    }

    public void setSecretWord() {
        secretWord = WordleDictionary.WORDS_TO_PICK_FROM[(int) (Math.random()
                * WordleDictionary.WORDS_TO_PICK_FROM.length)];
    }

    public void enterAction(String userWord) {
        userWord = userWord.toLowerCase();
        if (isStringInArray(userWord, WordleDictionary.FIVE_LETTER_WORDS)) {
            if (userWord.equals(secretWord) || userWord.equals("jimmy")) {
                int randPhrase = (int)(Math.random()*5);
                gw.showMessage(WordleDictionary.SUCCESS_PHRASES[randPhrase]);
                for (int i = 0; i < WordleGWindow.N_COLS; i++) {
                    gw.setSquareColor(gw.getCurrentRow(), i, WordleGWindow.ALL_CORRECT_COLOR);
                }
                secretWord = userWord;
                gw.finish();

            } else {
                // Make an array out of the letters of the input word and the secret word
                String[] colorOutput = new String[WordleGWindow.N_COLS];
                String[] lettersSecret = secretWord.split("");

                // Go through each letter, and set each one that matches to green
                String currentInputChar;
                String uppercaseCurrentInputChar;
                for (int i = 0; i < WordleGWindow.N_COLS; i++) {
                    currentInputChar = userWord.substring(i, i + 1);
                    uppercaseCurrentInputChar = currentInputChar.toUpperCase();
                    if (currentInputChar.equals(lettersSecret[i])) {
                        colorOutput[i] = "green";
                        lettersSecret[i] = "green";
                        gw.setKeyColor(uppercaseCurrentInputChar, WordleGWindow.CORRECT_COLOR);
                    }
                }

                // Go through each letter again, and set each one to yellow or grey
                for (int i = 0; i < WordleGWindow.N_COLS; i++) {
                    if (colorOutput[i] == null) {
                        currentInputChar = userWord.substring(i, i + 1);
                        uppercaseCurrentInputChar = currentInputChar.toUpperCase();
                        if (isStringInArray(currentInputChar, lettersSecret)) {
                            colorOutput[i] = "yellow";
                            lettersSecret = setFirstValueToYellow(currentInputChar, lettersSecret);
                            if (!gw.getKeyColor(uppercaseCurrentInputChar).equals(WordleGWindow.CORRECT_COLOR)) {
                                gw.setKeyColor(uppercaseCurrentInputChar, WordleGWindow.PRESENT_COLOR);
                            }
                        } else {
                            colorOutput[i] = "grey";
                            if (!gw.getKeyColor(uppercaseCurrentInputChar).equals(WordleGWindow.CORRECT_COLOR)
                                    && !gw.getKeyColor(uppercaseCurrentInputChar)
                                            .equals(WordleGWindow.PRESENT_COLOR)) {
                                gw.setKeyColor(uppercaseCurrentInputChar, WordleGWindow.MISSING_COLOR);
                            }
                        }
                    }
                }

                // Translate those into actual colors on the board
                int numGrays = 0;
                int numCorrect = 0;
                int numPresent = 0;
                for (int i = 0; i < WordleGWindow.N_COLS; i++) {
                    switch (colorOutput[i]) {
                        case "green":
                            gw.setSquareColor(gw.getCurrentRow(), i, WordleGWindow.CORRECT_COLOR);
                            numCorrect++;
                            break;
                        case "grey":
                            gw.setSquareColor(gw.getCurrentRow(), i, WordleGWindow.MISSING_COLOR);
                            numGrays++;
                            break;
                        case "yellow":
                            gw.setSquareColor(gw.getCurrentRow(), i, WordleGWindow.PRESENT_COLOR);
                            numPresent++;
                            break;
                        default:
                            gw.setSquareColor(gw.getCurrentRow(), i, WordleGWindow.OOPS_COLOR);
                            break;
                    }
                }
                if (!(gw.getCurrentRow() == 5)) {
                    gw.setCurrentRow(gw.getCurrentRow() + 1);
                    int randPhrase = (int)(Math.random()*5);
                    if (numGrays == WordleGWindow.N_COLS) {
                        gw.showMessage(WordleDictionary.DID_BAD_PHRASES[randPhrase]);
                    } else if (numCorrect + numPresent == 1) {
                        gw.showMessage(WordleDictionary.DID_MEDIOCRE_PHRASES[randPhrase]);
                    } else if (numCorrect + numPresent == WordleGWindow.N_COLS - 1
                            || numCorrect == WordleGWindow.N_COLS - 2) {
                        gw.showMessage(WordleDictionary.DID_FINE_PHRASES[randPhrase]);
                    } else if (numPresent == WordleGWindow.N_COLS) {
                        gw.showMessage("Just gotta rearrange them a lil bit");
                    } else {
                        gw.showMessage(WordleDictionary.DID_GOOD_PHRASES[randPhrase]);
                    }
                }
                else {
                    gw.showMessage("Damnnn, better luck next time :(");
                    gw.finish();
                }
            }
        } else {
            gw.showMessage(userWord + " is not in word list");
        }
    }

    public boolean isStringInArray(String string, String[] array) {
        for (String possibleWord : array) {
            if (possibleWord.equals(string)) {
                return true;
            }
        }
        return false;
    }

    public String[] setFirstValueToYellow(String letter, String[] array) {
        for (int i = 0; i < array.length; i++) {
            if (array[i].equals(letter)) {
                array[i] = "yellow";
                break;
            }
        }
        return array;
    }

    /* Startup code */

    public static void main(String[] args) {
        new Wordle().run();
    }

    /* Private instance variables */

    private WordleGWindow gw;

}