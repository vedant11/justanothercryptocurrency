npm run dev &> logfile & process=$!;
tail -F logfile | grep -m1 'app started' && kill $process && echo $process;
exit 0;