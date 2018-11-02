#!/usr/bin/expect

set test_case "expect_create test case "
# no timeout -1
set timeout -1
set action "create"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set passwd [lindex $argv 2]
set sourceChain [lindex $argv 3]

set fd [open ./test a]

if {$testnet eq "true"} {
	set test "--testnet"
} else {
	set test ""
}

spawn node ../commands/cli.js $test

# log_file test_log

expect "wallet-cli$ "

send "${action}\n"

expect {
	"Chain" {
		send "${sourceChain}\n"
		}
}

expect {
	"Please input again." {
		puts $fd "${test_case} failed, Chain: ${sourceChain}"
		send "exit\n"
		exit
	}
	"Input the password:" {
		send "${passwd}\n"
	}
}

expect {
	"Confirm the password:" {
		send "${passwd}\n"
	}
}

expect {
	"Password mismatched." {
		puts $fd "${test_case} failed, Password mismatched.: ${passwd}"
		send "exit\n"
		exit		
	}
	"Account: " {
		puts $fd "${test_case} successful"
	}
}

expect {
	"wallet-cli$ " {
		send "exit\n"
	}
	eof {
		exit
	}
}

expect eof
close $fd
exit

