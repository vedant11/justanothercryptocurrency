# process
# npm run dev | export process=$! & echo "$! works| real is $process" && kill -9 process;
npm run dev &> logfile & process=$!;
tail -F logfile | grep -m1 'app started' && kill $process && echo $process && exit 0;